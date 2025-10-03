import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar, MapPin, DollarSign, Users, ExternalLink, Sparkles, 
  TrendingUp, Star, Crown, Mic, Filter, SortAsc, ArrowUpDown,
  ChevronLeft, ChevronRight, Megaphone, Plus
} from 'lucide-react';
import SmartSearch from './SmartSearch';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedEventList = ({ events }) => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('ai_recommended');
  const [displayEvents, setDisplayEvents] = useState(events);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const categories = ['All', ...new Set(events.map(event => event.category))];
  const sources = ['All', 'Local Events', 'TicketMaster'];
  
  const sortOptions = [
    { value: 'ai_recommended', label: '🤖 AI Recommended', icon: Sparkles },
    { value: 'soonest', label: '⏰ Soonest', icon: Calendar },
    { value: 'price_low', label: '💰 Price: Low to High', icon: DollarSign },
    { value: 'price_high', label: '💸 Price: High to Low', icon: DollarSign },
    { value: 'popularity', label: '🔥 Most Popular', icon: TrendingUp },
    { value: 'rating', label: '⭐ Highest Rated', icon: Star }
  ];

  useEffect(() => {
    setDisplayEvents(events);
    fetchFeaturedContent();
  }, [events]);

  const fetchFeaturedContent = async () => {
    try {
      // Fetch featured events
      const featuredResponse = await axios.get(`${API}/events/featured`);
      setFeaturedEvents(featuredResponse.data.slice(0, 4));

      // Fetch trending events
      const trendingResponse = await axios.get(`${API}/recommendations/trending?limit=5`);
      setTrendingEvents(trendingResponse.data.trending_events || []);

      // Fetch personalized recommendations if user is logged in
      if (user) {
        const personalizedResponse = await axios.post(`${API}/recommendations/personalized`, {
          user_preferences: "Show me events I might like"
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPersonalizedRecs(personalizedResponse.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching featured content:', error);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setDisplayEvents(results.events || []);
  };

  const resetToAllEvents = () => {
    setSearchResults(null);
    setDisplayEvents(events);
    setSearchTerm('');
    setSelectedCategory('All');
    setSourceFilter('All');
    setSortBy('ai_recommended');
  };

  const applyFiltersAndSort = (eventsToProcess = displayEvents) => {
    let filtered = eventsToProcess.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesSource = sourceFilter === 'All' || 
                           (sourceFilter === 'Local Events' && event.source !== 'ticketmaster') ||
                           (sourceFilter === 'TicketMaster' && event.source === 'ticketmaster');
      return matchesSearch && matchesCategory && matchesSource;
    });

    // Apply sorting
    switch (sortBy) {
      case 'soonest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.available_tickets || 0) - (a.available_tickets || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'ai_recommended':
      default:
        // Keep original AI-recommended order
        break;
    }

    return filtered;
  };

  const filteredEvents = applyFiltersAndSort();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceBadge = (source) => {
    return source === 'ticketmaster' ? 
      { text: 'TicketMaster', class: 'bg-blue-100 text-blue-800', icon: ExternalLink } :
      { text: 'Local Event', class: 'bg-green-100 text-green-800', icon: Crown };
  };

  const getAIMatchScore = (event) => {
    if (user && searchResults?.events) {
      return Math.floor(Math.random() * 20) + 80; // Demo: 80-100% match
    }
    return null;
  };

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === featuredEvents.length - 1 ? 0 : prev + 1
    );
  };

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === 0 ? featuredEvents.length - 1 : prev - 1
    );
  };

  return (
    <div className="space-y-8" data-testid="enhanced-event-list">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{fontFamily: 'Space Grotesk'}}>
            Discover Smart,
            <span className="text-gradient block">Verified Events</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Powered by AI, personalized for you. Find the perfect events from local venues and TicketMaster.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{events.length}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{events.filter(e => e.source !== 'ticketmaster').length}</div>
              <div className="text-sm text-gray-600">Local Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.filter(e => e.source === 'ticketmaster').length}</div>
              <div className="text-sm text-gray-600">TicketMaster</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center" style={{fontFamily: 'Space Grotesk'}}>
              <Crown className="w-8 h-8 mr-3 text-yellow-500" />
              Featured Events
            </h2>
            <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
              Hand-picked & Trending
            </Badge>
          </div>

          {/* Featured Events Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentFeaturedIndex * 100}%)` }}
              >
                {featuredEvents.map((event, index) => (
                  <div key={event.id} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 md:p-12 relative overflow-hidden">
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                          <Badge className="bg-white/20 text-white mb-4" data-testid={`featured-badge-${event.id}`}>
                            ⭐ Featured Event
                          </Badge>
                          <h3 className="text-3xl md:text-4xl font-bold mb-4" data-testid={`featured-title-${event.id}`}>
                            {event.name}
                          </h3>
                          <p className="text-lg text-purple-100 mb-6 line-clamp-3" data-testid={`featured-description-${event.id}`}>
                            {event.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mb-6 text-purple-100">
                            <div className="flex items-center">
                              <Calendar className="w-5 h-5 mr-2" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl font-bold">
                              ${event.price}
                            </div>
                            <div className="flex space-x-3">
                              <Link to={`/events/${event.id}`}>
                                <Button className="bg-white text-purple-600 hover:bg-gray-100" data-testid={`featured-view-${event.id}`}>
                                  View Details
                                </Button>
                              </Link>
                              {event.source === 'ticketmaster' ? (
                                <Button 
                                  onClick={() => window.open(event.external_url, '_blank')}
                                  className="bg-purple-800 hover:bg-purple-900"
                                  data-testid={`featured-buy-tm-${event.id}`}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Buy on TicketMaster
                                </Button>
                              ) : (
                                <Link to={`/book/${event.id}`}>
                                  <Button className="bg-purple-800 hover:bg-purple-900" data-testid={`featured-book-${event.id}`}>
                                    Book Now
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          <img
                            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                            alt={event.name}
                            className="rounded-xl shadow-2xl w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600';
                            }}
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation */}
            {featuredEvents.length > 1 && (
              <>
                <button
                  onClick={prevFeatured}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  data-testid="featured-prev-btn"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextFeatured}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  data-testid="featured-next-btn"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeaturedIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentFeaturedIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      data-testid={`featured-indicator-${index}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Personalized Recommendations for Logged-in Users */}
      {user && personalizedRecs.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-emerald-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Recommended for You, {user.name}
            </h3>
            <Badge className="bg-emerald-100 text-emerald-800">
              AI Powered
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personalizedRecs.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {event.name}
                </h4>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">{event.category}</span>
                  <span className="font-bold text-emerald-600">${event.price}</span>
                </div>
                {event.recommendation_score && (
                  <div className="flex items-center text-xs text-emerald-600 mb-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {Math.floor(event.recommendation_score * 100)}% match
                  </div>
                )}
                <Link to={`/events/${event.id}`}>
                  <Button size="sm" className="w-full btn-primary">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Smart Search Section */}
      <div className="mb-8">
        <SmartSearch onResults={handleSearchResults} isMainSearch={true} />
      </div>

      {/* Advanced Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Quick filter by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                data-testid="quick-filter-input"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              data-testid="category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              data-testid="source-filter"
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              data-testid="sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-600" data-testid="results-summary">
            {searchResults ? 
              `Showing ${filteredEvents.length} AI search results` :
              `Showing ${filteredEvents.length} of ${events.length} events`
            }
            {sortBy !== 'ai_recommended' && (
              <span className="ml-2 text-sm">• Sorted by {sortOptions.find(o => o.value === sortBy)?.label}</span>
            )}
          </p>
          {searchResults && (
            <Button 
              onClick={resetToAllEvents}
              variant="outline" 
              size="sm"
              data-testid="clear-search-btn"
            >
              Clear Search
            </Button>
          )}
        </div>
      </div>

      {/* Call to Action for Event Organizers */}
      <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <CardContent className="p-6 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Want to feature your event here?</h3>
          <p className="text-orange-100 mb-4">
            Reach smart fans and boost your event's visibility on TicketAI
          </p>
          <Button className="bg-white text-orange-600 hover:bg-gray-100">
            <Plus className="w-4 h-4 mr-2" />
            List Your Event
          </Button>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="no-events-title">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' || sourceFilter !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Check back later for new events'}
            </p>
            <Button onClick={resetToAllEvents} className="btn-primary">
              {searchTerm || selectedCategory !== 'All' || sourceFilter !== 'All' 
                ? 'Clear Filters' 
                : 'Explore All Events'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const sourceBadge = getSourceBadge(event.source);
            const aiMatch = getAIMatchScore(event);
            
            return (
              <Card 
                key={event.id} 
                className="event-card overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                data-testid={`event-card-${event.id}`}
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <Badge className="badge-primary" data-testid={`event-category-${event.id}`}>
                      {event.category}
                    </Badge>
                    {aiMatch && user && (
                      <Badge className="bg-purple-100 text-purple-800" data-testid={`ai-match-${event.id}`}>
                        🤖 {aiMatch}% match
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 space-y-2">
                    <Badge className={sourceBadge.class} data-testid={`event-source-${event.id}`}>
                      <sourceBadge.icon className="w-3 h-3 mr-1" />
                      {sourceBadge.text}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        ${event.price}
                      </div>
                      {event.price > 0 && (
                        <div className="text-xs text-gray-600 text-center">per ticket</div>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {event.average_rating && event.average_rating > 4.0 && (
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-sm flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {event.average_rating.toFixed(1)}
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors" data-testid={`event-title-${event.id}`}>
                    {event.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2" data-testid={`event-description-${event.id}`}>
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                      <span data-testid={`event-date-${event.id}`}>
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                      <span data-testid={`event-location-${event.id}`} className="line-clamp-1">
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-indigo-600" />
                        <span data-testid={`event-tickets-${event.id}`}>
                          {event.available_tickets} left
                        </span>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {event.tags.slice(0, 2).map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs px-2 py-0.5"
                              data-testid={`event-tag-${event.id}-${index}`}
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4">
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full btn-secondary"
                        data-testid={`view-event-btn-${event.id}`}
                      >
                        View Details
                      </Button>
                    </Link>
                    {event.source === 'ticketmaster' ? (
                      <Button
                        onClick={() => window.open(event.external_url || 'https://www.ticketmaster.com', '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid={`buy-ticketmaster-btn-${event.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buy on TicketMaster
                      </Button>
                    ) : (
                      <Link to={`/book/${event.id}`} className="flex-1">
                        <Button 
                          className="w-full btn-primary"
                          disabled={event.available_tickets === 0}
                          data-testid={`book-local-btn-${event.id}`}
                        >
                          {event.available_tickets === 0 ? 'Sold Out' : 'Book Now'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedEventList;