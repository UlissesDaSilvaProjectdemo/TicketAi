import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, Users, Flag, Star, ExternalLink } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UKFestivalsShowcase = () => {
  const [ukEvents, setUkEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const months = ['All', 'October 2025', 'November 2025', '2026 Highlights'];
  const categories = ['All', 'Music', 'Arts'];

  useEffect(() => {
    fetchUKEvents();
  }, []);

  const fetchUKEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/events`);
      // Filter for UK events
      const ukFilteredEvents = response.data.filter(event => 
        event.location && event.location.includes('UK')
      );
      setUkEvents(ukFilteredEvents);
    } catch (error) {
      console.error('Error fetching UK events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventMonth = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    
    if (year === 2026) return '2026 Highlights';
    return `${month} ${year}`;
  };

  const filteredEvents = ukEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const eventMonth = getEventMonth(event.date);
    const matchesMonth = selectedMonth === 'All' || eventMonth === selectedMonth;
    return matchesCategory && matchesMonth;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeaturedEvents = () => {
    return [
      {
        title: "🎶 Music Festivals Highlights",
        events: ukEvents.filter(e => e.category === 'Music').slice(0, 3),
        color: "from-purple-500 to-pink-500"
      },
      {
        title: "🎨 Art & Culture Festivals",
        events: ukEvents.filter(e => e.category === 'Arts').slice(0, 3),
        color: "from-blue-500 to-teal-500"
      }
    ];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading UK festivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="uk-festivals-showcase">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-600 via-white to-blue-600 rounded-2xl p-8 text-center">
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Flag className="w-12 h-12 text-red-600 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>
              UK Festivals 2025-2026
            </h1>
            <Flag className="w-12 h-12 text-blue-600 ml-4" />
          </div>
          <p className="text-xl text-gray-800 mb-6 max-w-3xl mx-auto leading-relaxed">
            Discover the best of British culture with our comprehensive guide to UK festivals. 
            From world-class music festivals to prestigious art exhibitions, experience the vibrant cultural scene across England, Scotland, and Wales.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
              🎶 {ukEvents.filter(e => e.category === 'Music').length} Music Festivals
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              🎨 {ukEvents.filter(e => e.category === 'Arts').length} Art & Culture Events
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              📍 {new Set(ukEvents.map(e => e.location.split(',')[0])).size} Cities
            </Badge>
          </div>
        </div>
      </div>

      {/* Featured Highlights */}
      <div className="space-y-6">
        {getFeaturedEvents().map((section, index) => (
          <Card key={index} className={`bg-gradient-to-r ${section.color} text-white overflow-hidden`}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {section.events.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  >
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {event.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location.replace(', UK', '')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">£{event.price}</span>
                        </div>
                        <Link to={`/events/${event.id}`}>
                          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter Festivals:</h3>
          
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                data-testid={`uk-category-filter-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            {months.map(month => (
              <Button
                key={month}
                onClick={() => setSelectedMonth(month)}
                variant={selectedMonth === month ? "default" : "outline"}
                size="sm"
                data-testid={`uk-month-filter-${month.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Showing {filteredEvents.length} of {ukEvents.length} UK festivals and events
          </p>
        </div>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <Card 
            key={event.id} 
            className="event-card overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200"
            data-testid={`uk-event-card-${event.id}`}
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
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-800" data-testid={`uk-flag-${event.id}`}>
                  🇬🇧 UK
                </Badge>
                <Badge className="badge-primary" data-testid={`uk-category-${event.id}`}>
                  {event.category}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-sm font-semibold text-gray-900">
                    £{event.price}
                  </span>
                </div>
              </div>
              {event.average_rating > 4.0 && (
                <div className="absolute bottom-4 left-4">
                  <div className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {event.average_rating.toFixed(1)}
                  </div>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2" data-testid={`uk-title-${event.id}`}>
                {event.name}
              </CardTitle>
              <CardDescription className="text-gray-600 line-clamp-2" data-testid={`uk-description-${event.id}`}>
                {event.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                  <span data-testid={`uk-date-${event.id}`}>
                    {formatDate(event.date)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                  <span data-testid={`uk-location-${event.id}`}>
                    {event.location.replace(', UK', '')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    <span data-testid={`uk-tickets-${event.id}`}>
                      {event.available_tickets} tickets left
                    </span>
                  </div>
                  <div className="flex items-center font-semibold text-lg text-indigo-600">
                    <span>£</span>
                    <span data-testid={`uk-price-${event.id}`}>
                      {event.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs px-2 py-1"
                      data-testid={`uk-tag-${event.id}-${index}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Link to={`/events/${event.id}`} className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full btn-secondary"
                    data-testid={`uk-view-btn-${event.id}`}
                  >
                    View Details
                  </Button>
                </Link>
                <Link to={`/book/${event.id}`} className="flex-1">
                  <Button 
                    className="w-full btn-primary"
                    disabled={event.available_tickets === 0}
                    data-testid={`uk-book-btn-${event.id}`}
                  >
                    {event.available_tickets === 0 ? 'Sold Out' : 'Book Now'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <Card className="p-12 text-center">
          <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No UK festivals found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters to see more events.
          </p>
          <Button 
            onClick={() => {
              setSelectedCategory('All');
              setSelectedMonth('All');
            }}
            className="btn-primary"
          >
            Show All UK Events
          </Button>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Experience UK's Best Festivals?
        </h2>
        <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
          From London's prestigious art fairs to Edinburgh's legendary music sessions, 
          discover the rich cultural tapestry of the United Kingdom.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/recommendations">
            <Button className="bg-white text-indigo-600 hover:bg-gray-100">
              Get AI Recommendations
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
              Browse All Events
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UKFestivalsShowcase;