import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar, MapPin, DollarSign, Users, CreditCard, 
  Lock, CheckCircle, AlertCircle, ArrowLeft 
} from 'lucide-react';

const BookingPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, setShowAuth } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [bookingStep, setBookingStep] = useState('details'); // details, payment, confirmation
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Mock event data (in real app, this would fetch from API)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvent({
        id: eventId,
        name: "Summer Music Festival 2025",
        description: "Join us for an amazing outdoor music festival featuring top artists from around the world. Food trucks, art installations, and multiple stages await!",
        date: "2025-07-15T19:00:00Z",
        location: "Central Park, New York, NY",
        venue: "Great Lawn",
        price: 85,
        available_tickets: 250,
        category: "Music",
        image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        organizer: "NYC Events Co.",
        duration: "8 hours",
        age_restriction: "18+"
      });
      setLoading(false);
    }, 1000);
  }, [eventId]);

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

  const handleBooking = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setBookingStep('payment');
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setBookingStep('confirmation');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
        <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (bookingStep === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">{event.name}</h3>
              <p className="text-green-600">{formatDate(event.date)}</p>
              <p className="text-green-600">{event.location}</p>
              <p className="text-green-800 font-semibold">
                {ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''} - ${(event.price * ticketQuantity).toFixed(2)}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Confirmation email sent to: {user?.email}</p>
              <p>Booking ID: BK-{Date.now()}</p>
            </div>
            <div className="space-y-2 pt-4">
              <Button onClick={() => navigate('/')} className="w-full btn-primary">
                Browse More Events
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                View My Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <Card>
            <div className="relative h-64 overflow-hidden rounded-t-lg">
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className="badge-primary">{event.category}</Badge>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{event.name}</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-indigo-600" />
                  <span>{event.available_tickets} tickets available</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Event Description</h3>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Organizer</span>
                    <p className="font-medium">{event.organizer}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="font-medium">{event.duration}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Venue</span>
                    <p className="font-medium">{event.venue}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Age Restriction</span>
                    <p className="font-medium">{event.age_restriction}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Book Tickets</span>
                <div className="text-2xl font-bold text-indigo-600">
                  ${event.price}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {bookingStep === 'details' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <select 
                      value={ticketQuantity}
                      onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>
                          {num} ticket{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Ticket price ({ticketQuantity}x)</span>
                      <span>${(event.price * ticketQuantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Service fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${(event.price * ticketQuantity + 5).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBooking}
                    className="w-full btn-primary text-lg py-3"
                    disabled={event.available_tickets === 0}
                  >
                    {event.available_tickets === 0 ? 'Sold Out' : 'Continue to Payment'}
                  </Button>
                </>
              )}

              {bookingStep === 'payment' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Payment Details</span>
                    </div>
                    <p className="text-blue-700 text-sm">
                      💳 This is a demo payment form. Use any test card details.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input 
                      type="text"
                      defaultValue="Ulisses Da Silva"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input 
                      type="text"
                      defaultValue="6565 6587 8789 9000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input 
                        type="text"
                        defaultValue="09/27"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input 
                        type="text"
                        defaultValue="678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Demo Test Card Details:</p>
                    <div className="text-xs font-mono text-gray-600 space-y-1">
                      <div>Name: Ulisses Da Silva</div>
                      <div>Card: 6565 6587 8789 9000</div>
                      <div>Expiry: 09/27</div>
                      <div>CVV: 678</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Subtotal</span>
                      <span>${(event.price * ticketQuantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Service fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${(event.price * ticketQuantity + 5).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handlePayment}
                      disabled={paymentProcessing}
                      className="w-full btn-primary text-lg py-3"
                    >
                      {paymentProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          Complete Booking
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => setBookingStep('details')}
                      variant="outline"
                      className="w-full"
                      disabled={paymentProcessing}
                    >
                      Back
                    </Button>
                  </div>

                  <div className="flex items-center text-xs text-gray-500">
                    <Lock className="w-3 h-3 mr-1" />
                    Secured by 256-bit SSL encryption
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;