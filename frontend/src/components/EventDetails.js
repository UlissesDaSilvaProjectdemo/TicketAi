import React, { useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, Users, ArrowLeft, Clock } from 'lucide-react';

const EventDetails = ({ events }) => {
  const { eventId } = useParams();
  const { user, setShowAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="text-center py-12" data-testid="event-not-found">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h3>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
        <Link to="/">
          <Button className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const handleBooking = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    navigate(`/book/${event.id}`);
  };

  const dateInfo = formatDate(event.date);
  const isEventPast = new Date(event.date) < new Date();
  const isSoldOut = event.available_tickets === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="event-details">
      {/* Back Button */}
      <Link to="/">
        <Button variant="outline" className="btn-secondary" data-testid="back-to-events-btn">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      {/* Event Header */}
      <div className="relative">
        <div className="h-64 md:h-80 rounded-2xl overflow-hidden">
          <img
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <Badge className="mb-3 bg-white/20 text-white border-white/30" data-testid="event-category-badge">
              {event.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="event-title">
              {event.name}
            </h1>
            <p className="text-white/90 text-lg" data-testid="event-short-description">
              {event.description.split('.')[0]}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed" data-testid="event-full-description">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Event Features */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700">Great networking opportunities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700">Well-organized schedule</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700">Prime location</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-gray-700">Perfect timing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6 space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-center justify-center text-3xl font-bold text-indigo-600">
                  <DollarSign className="w-6 h-6 mr-1" />
                  <span data-testid="event-price-sidebar">{event.price}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">per ticket</p>
              </div>

              {/* Event Details */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900" data-testid="event-date-sidebar">
                      {dateInfo.full}
                    </p>
                    <p className="text-sm text-gray-600" data-testid="event-time-sidebar">
                      {dateInfo.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900" data-testid="event-location-sidebar">
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-600">Event venue</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900" data-testid="tickets-available-sidebar">
                      {event.available_tickets} tickets left
                    </p>
                    <p className="text-sm text-gray-600">
                      of {event.total_tickets} total tickets
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Button */}
              <div className="border-t border-gray-100 pt-6">
                {isEventPast ? (
                  <Button
                    disabled
                    className="w-full bg-gray-400"
                    data-testid="event-past-btn"
                  >
                    Event Has Passed
                  </Button>
                ) : isSoldOut ? (
                  <Button
                    disabled
                    className="w-full bg-gray-400"
                    data-testid="sold-out-btn"
                  >
                    Sold Out
                  </Button>
                ) : (
                  <Button
                    onClick={handleBooking}
                    className="w-full btn-primary text-lg py-3"
                    data-testid="book-now-btn"
                  >
                    {user ? 'Book Now' : 'Sign In to Book'}
                  </Button>
                )}

                {!user && !isEventPast && !isSoldOut && (
                  <p className="text-xs text-gray-600 text-center mt-2">
                    Create an account or sign in to complete your booking
                  </p>
                )}
              </div>

              {/* Security Note */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  🔒 Secure checkout with instant ticket delivery
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;