import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, Users, ExternalLink, ShoppingCart } from 'lucide-react';

const EventCard = ({ event, testIdPrefix = 'event' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className="event-card overflow-hidden hover:shadow-2xl transition-all duration-300"
      data-testid={`${testIdPrefix}-card-${event.id}`}
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
          <Badge className="badge-primary" data-testid={`${testIdPrefix}-category-${event.id}`}>
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 space-y-2">
          {event.source === 'ticketmaster' ? (
            <Badge className="bg-blue-100 text-blue-800" data-testid={`${testIdPrefix}-source-${event.id}`}>
              TicketMaster
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800" data-testid={`${testIdPrefix}-source-${event.id}`}>
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
        {/* Event Title and Buy Button Container */}
        <div className="event-header flex items-start justify-between gap-4 mb-3">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 flex-1" data-testid={`${testIdPrefix}-title-${event.id}`}>
            {event.name}
          </CardTitle>
          {/* Buy Ticket Button next to title */}
          {event.source === 'ticketmaster' ? (
            <Button
              onClick={() => window.open(event.external_url || 'https://www.ticketmaster.com', '_blank')}
              size="sm"
              className="btn-primary whitespace-nowrap flex-shrink-0"
              data-testid={`buy-ticket-btn-${event.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy Ticket
            </Button>
          ) : (
            <Button 
              onClick={() => window.location.href = `/book/${event.id}`}
              size="sm"
              className="btn-primary whitespace-nowrap flex-shrink-0"
              disabled={event.available_tickets === 0}
              data-testid={`buy-ticket-btn-${event.id}`}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {event.available_tickets === 0 ? 'Sold Out' : 'Buy Ticket'}
            </Button>
          )}
        </div>
        
        <CardDescription className="text-gray-600 line-clamp-2" data-testid={`${testIdPrefix}-description-${event.id}`}>
          {event.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
            <span data-testid={`${testIdPrefix}-date-${event.id}`}>
              {formatDate(event.date)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
            <span data-testid={`${testIdPrefix}-location-${event.id}`}>
              {event.location}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2 text-indigo-600" />
              <span data-testid={`${testIdPrefix}-tickets-available-${event.id}`}>
                {event.available_tickets} tickets left
              </span>
            </div>
            <div className="flex items-center font-semibold text-lg text-indigo-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span data-testid={`${testIdPrefix}-price-${event.id}`}>
                {event.price}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          {event.source === 'ticketmaster' ? (
            <Button
              onClick={() => window.open(event.external_url || 'https://www.ticketmaster.com', '_blank')}
              variant="outline"
              className="flex-1 btn-secondary"
              data-testid={`view-ticketmaster-btn-${event.id}`}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on TicketMaster
            </Button>
          ) : (
            <Link to={`/events/${event.id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full btn-secondary"
                data-testid={`view-event-btn-${event.id}`}
              >
                View Details
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;