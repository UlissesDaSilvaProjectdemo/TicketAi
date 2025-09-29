import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react';

const EventList = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(events.map(event => event.category))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            Find and book tickets for the most exciting events in your area. 
            Powered by AI to match you with perfect experiences.
          </p>
          <Link to="/recommendations">
            <Button className="btn-primary btn-lg" data-testid="get-ai-recommendations-btn">
              Get AI Recommendations
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="glass p-6 rounded-2xl space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events, locations, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full"
            data-testid="search-events"
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
                <div className="absolute top-4 right-4">
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