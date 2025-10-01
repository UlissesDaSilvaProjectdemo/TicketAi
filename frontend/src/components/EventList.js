import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, Users, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import SmartSearch from './SmartSearch';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EventList = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [displayEvents, setDisplayEvents] = useState(events);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = ['All', ...new Set(events.map(event => event.category))];
  const sources = ['All', 'Local Events', 'TicketMaster'];

  useEffect(() => {
    setDisplayEvents(events);
  }, [events]);

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
  };

  const filteredEvents = displayEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSource = sourceFilter === 'All' || 
                         (sourceFilter === 'Local Events' && event.source !== 'ticketmaster') ||
                         (sourceFilter === 'TicketMaster' && event.source === 'ticketmaster');
    return matchesSearch && matchesCategory && matchesSource;
  });

  const getSourceBadge = (source) => {
    return source === 'ticketmaster' ? 
      { text: 'TicketMaster', class: 'bg-blue-100 text-blue-800' } :
      { text: 'Local Event', class: 'bg-green-100 text-green-800' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8" data-testid="event-list">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{fontFamily: 'Space Grotesk'}}>
            Discover Amazing
            <span className="text-gradient block">Events</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Find and book tickets for the most exciting events from local venues and TicketMaster. 
            Powered by AI to match you with perfect experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/recommendations">
              <Button className="btn-primary btn-lg" data-testid="get-ai-recommendations-btn">
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Recommendations
              </Button>
            </Link>
            <Button 
              onClick={resetToAllEvents}
              variant="outline" 
              className="btn-secondary btn-lg"
              data-testid="browse-all-events-btn"
            >
              Browse All Events
            </Button>
          </div>
        </div>
      </div>

      {/* AI Search Section */}
      <div className="mb-8">
        <AISearchBar onResults={handleSearchResults} isMainSearch={true} />
      </div>

      {/* Search Results Analysis */}
      {searchResults?.ai_analysis && (
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2" data-testid="search-ai-analysis-title">
                    AI Search Analysis
                  </h3>
                  <div 
                    className="text-purple-800 leading-relaxed ai-response-content" 
                    data-testid="search-ai-analysis-text"
                    dangerouslySetInnerHTML={{ __html: searchResults.ai_analysis }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <div className="glass p-6 rounded-2xl space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter current events by name, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full"
            data-testid="filter-events"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              data-testid={`category-filter-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map(source => (
            <Button
              key={source}
              onClick={() => setSourceFilter(source)}
              variant={sourceFilter === source ? "default" : "outline"}
              size="sm"
              data-testid={`source-filter-${source.toLowerCase().replace(' ', '-')}`}
            >
              {source}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600" data-testid="results-count">
          {searchResults ? 
            `Showing ${filteredEvents.length} AI search results` :
            `Showing ${filteredEvents.length} of ${events.length} events`
          }
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

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filters' 
              : 'Check back later for new events'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <Card 
              key={event.id} 
              className="event-card overflow-hidden hover:shadow-2xl transition-all duration-300"
              data-testid={`event-card-${event.id}`}
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className="badge-primary" data-testid={`event-category-${event.id}`}>
                    {event.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 space-y-2">
                  {event.source === 'ticketmaster' ? (
                    <Badge className="bg-blue-100 text-blue-800" data-testid={`event-source-${event.id}`}>
                      TicketMaster
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800" data-testid={`event-source-${event.id}`}>
                      Local Event
                    </Badge>
                  )}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold text-gray-900">
                      ${event.price}
                    </span>
                  </div>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2" data-testid={`event-title-${event.id}`}>
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
                    <span data-testid={`event-location-${event.id}`}>
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-indigo-600" />
                      <span data-testid={`event-tickets-available-${event.id}`}>
                        {event.available_tickets} tickets left
                      </span>
                    </div>
                    <div className="flex items-center font-semibold text-lg text-indigo-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span data-testid={`event-price-${event.id}`}>
                        {event.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  {event.source === 'ticketmaster' ? (
                    <>
                      <Button
                        onClick={() => window.open(event.external_url || 'https://www.ticketmaster.com', '_blank')}
                        variant="outline"
                        className="flex-1 btn-secondary"
                        data-testid={`view-ticketmaster-btn-${event.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on TicketMaster
                      </Button>
                      <Button
                        onClick={() => window.open(event.external_url || 'https://www.ticketmaster.com', '_blank')}
                        className="flex-1 btn-primary"
                        data-testid={`buy-ticketmaster-btn-${event.id}`}
                      >
                        Buy on TicketMaster
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to={`/events/${event.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full btn-secondary"
                          data-testid={`view-event-btn-${event.id}`}
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/book/${event.id}`} className="flex-1">
                        <Button 
                          className="w-full btn-primary"
                          disabled={event.available_tickets === 0}
                          data-testid={`book-ticket-btn-${event.id}`}
                        >
                          {event.available_tickets === 0 ? 'Sold Out' : 'Book Ticket'}
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;