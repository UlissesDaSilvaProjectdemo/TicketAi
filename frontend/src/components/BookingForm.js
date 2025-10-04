import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, DollarSign, CreditCard, CheckCircle, Coins } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingForm = ({ events }) => {
  const { eventId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [bookingData, setBookingData] = useState({
    ticketType: 'Standard',
    paymentMethod: 'card' // Default to card, will switch to credits if user has enough
  });
  const [creditBalance, setCreditBalance] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const event = events.find(e => e.id === eventId);

  useEffect(() => {
    fetchCreditBalance();
  }, [user]);

  const fetchCreditBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching credit balance in booking form, token exists:', !!token);
      if (!token) return;
      
      const response = await axios.get(`${API}/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Credit balance response in booking form:', response.data);
      setCreditBalance(response.data);
    } catch (error) {
      console.error('Error fetching credit balance in booking form:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  if (!event) {
    return <div>Event not found</div>;
  }

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

  const handlePaymentInputChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    // Format card number with spaces
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      value = value.substring(0, 19); // Limit to 16 digits + spaces
    }

    // Format expiry date
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2').substring(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentData({
      ...paymentData,
      [name]: value
    });
    setError('');
  };

  const handleBookTicket = async () => {
    try {
      setLoading(true);
      setError('');

      if (bookingData.paymentMethod === 'credits') {
        // Book with credits
        const response = await axios.post(`${API}/tickets/checkout/credits`, {
          event_id: eventId,
          user_email: user.email,
          user_name: user.name,
          ticket_type: bookingData.ticketType
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.ticket) {
          setTicket(response.data.ticket);
          setCreditBalance(prev => prev ? { ...prev, balance: prev.balance - 5 } : null);
          setStep(3); // Success step
        }
      } else {
        // Book with card payment
        const response = await axios.post(`${API}/tickets/checkout`, {
          event_id: eventId,
          user_email: user.email,
          user_name: user.name,
          ticket_type: bookingData.ticketType,
          success_url: `${window.location.origin}/booking-success`,
          cancel_url: `${window.location.origin}/events/${eventId}`
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.checkout_url) {
          // Redirect to payment processor
          window.location.href = response.data.checkout_url;
        } else if (response.data.ticket) {
          // Direct booking success (for demo purposes)
          setTicket(response.data.ticket);
          setStep(3); // Success step
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalBooking = (e) => {
    e.preventDefault();
    handleBookTicket();
  };

  if (step === 3 && ticket) {
    return (
      <div className="max-w-2xl mx-auto" data-testid="booking-success">
        <Card className="text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800" data-testid="booking-success-title">
              Booking Confirmed!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your ticket has been booked successfully. Check your email for confirmation.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2" data-testid="booked-event-name">
                {event.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span data-testid="booked-event-date">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span data-testid="booked-event-location">{event.location}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="qr-code-container mx-auto max-w-xs" data-testid="ticket-qr-code">
              <h4 className="font-semibold text-gray-900 mb-3">Your Ticket QR Code</h4>
              <img
                src={ticket.qr_code}
                alt="Ticket QR Code"
                className="w-full h-auto"
              />
              <p className="text-xs text-gray-600 mt-2">
                Show this QR code at the event entrance
              </p>
            </div>

            {/* Ticket Details */}
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ticket ID:</span>
                  <p className="font-mono font-medium" data-testid="ticket-id">
                    {ticket.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Price Paid:</span>
                  <p className="font-semibold text-green-600" data-testid="ticket-price-paid">
                    {ticket.price === 0 ? '5 Credits' : `$${ticket.price}`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Ticket Type:</span>
                  <p className="font-medium" data-testid="ticket-type">
                    {ticket.ticket_type}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className="badge-success" data-testid="ticket-status">
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 btn-primary"
                data-testid="view-all-tickets-btn"
              >
                View All My Tickets
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 btn-secondary"
                data-testid="browse-more-events-btn"
              >
                Browse More Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="booking-form">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? 'Booking Details' : (bookingData.paymentMethod === 'credits' ? 'Confirm Booking' : 'Payment Information')}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? 'Review your booking details and proceed to payment'
                  : (bookingData.paymentMethod === 'credits' 
                    ? 'Confirm your booking with credits'
                    : 'Enter your payment information to complete the booking')
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === 1 ? (
                <form onSubmit={handlePayment} className="space-y-6" data-testid="booking-details-form">
                  {/* User Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="form-input bg-gray-50"
                          data-testid="booking-user-name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="form-input bg-gray-50"
                          data-testid="booking-user-email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ticket Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ticket Type</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="ticketType"
                          value="Standard"
                          checked={bookingData.ticketType === 'Standard'}
                          onChange={(e) => setBookingData({ ...bookingData, ticketType: e.target.value })}
                          className="text-indigo-600"
                          data-testid="ticket-type-standard"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Standard Ticket</div>
                          <div className="text-sm text-gray-600">General admission ticket</div>
                        </div>
                        <div className="font-semibold text-indigo-600">${event.price}</div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                    
                    {/* Credit Balance Display */}
                    {creditBalance && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Coins className="w-5 h-5 text-emerald-600 mr-2" />
                            <span className="text-sm font-medium text-emerald-800">
                              Current Balance: {creditBalance.balance} credits
                            </span>
                          </div>
                          <span className="text-xs text-emerald-600">
                            5 credits per ticket
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {/* Credits Payment Option */}
                      <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        bookingData.paymentMethod === 'credits' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${!creditBalance || creditBalance.balance < 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credits"
                          checked={bookingData.paymentMethod === 'credits'}
                          onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                          className="text-emerald-600"
                          disabled={!creditBalance || creditBalance.balance < 5}
                          data-testid="payment-method-credits"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center">
                            <Coins className="w-4 h-4 mr-2" />
                            Pay with Credits
                          </div>
                          <div className="text-sm text-gray-600">
                            {creditBalance && creditBalance.balance >= 5 
                              ? `Use 5 credits (${creditBalance.balance - 5} remaining)`
                              : 'Insufficient credits (need 5 credits)'
                            }
                          </div>
                        </div>
                        <div className="font-semibold text-emerald-600">5 Credits</div>
                      </label>

                      {/* Card Payment Option */}
                      <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        bookingData.paymentMethod === 'card' 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={bookingData.paymentMethod === 'card'}
                          onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value })}
                          className="text-indigo-600"
                          data-testid="payment-method-card"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay with Credit Card
                          </div>
                          <div className="text-sm text-gray-600">
                            Secure payment via Stripe
                          </div>
                        </div>
                        <div className="font-semibold text-indigo-600">${event.price}</div>
                      </label>
                    </div>

                    {/* Buy Credits Link */}
                    {(!creditBalance || creditBalance.balance < 5) && (
                      <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 mb-2">
                          Need more credits? 
                        </p>
                        <Button 
                          type="button"
                          size="sm" 
                          onClick={() => window.open('/pricing', '_blank')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Buy Credits
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full btn-primary" data-testid="proceed-to-payment-btn">
                    Proceed to Payment
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleFinalBooking} className="space-y-6" data-testid="payment-form">
                  {bookingData.paymentMethod === 'credits' ? (
                    /* Credit Payment Confirmation */
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment with Credits</h3>
                      
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                          <Coins className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-emerald-800 font-medium">
                            You're about to book this ticket using your credits
                          </p>
                          <div className="text-sm text-emerald-700">
                            <div className="flex justify-between items-center py-1">
                              <span>Current Balance:</span>
                              <span className="font-semibold">{creditBalance?.balance} credits</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span>Ticket Cost:</span>
                              <span className="font-semibold">5 credits</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-t border-emerald-300 mt-2 pt-2">
                              <span>Remaining Balance:</span>
                              <span className="font-bold">{(creditBalance?.balance || 0) - 5} credits</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Card Payment Form */
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💳 This is a demo payment form. Use any test card details.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardholderName"
                          value={paymentData.cardholderName}
                          onChange={handlePaymentInputChange}
                          className="form-input"
                          placeholder="John Doe"
                          required
                          data-testid="cardholder-name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentData.cardNumber}
                            onChange={handlePaymentInputChange}
                            className="form-input pl-10"
                            placeholder="1234 5678 9012 3456"
                            required
                            data-testid="card-number"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentInputChange}
                            className="form-input"
                            placeholder="MM/YY"
                            required
                            data-testid="expiry-date"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handlePaymentInputChange}
                            className="form-input"
                            placeholder="123"
                            required
                            data-testid="cvv"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="payment-error">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button 
                      type="button" 
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 btn-secondary"
                      data-testid="back-to-details-btn"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 btn-primary"
                      data-testid="complete-booking-btn"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </div>
                      ) : (
                        'Complete Booking'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Image */}
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400';
                  }}
                />
              </div>

              {/* Event Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2" data-testid="summary-event-name">
                  {event.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span data-testid="summary-event-date">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span data-testid="summary-event-location">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Type:</span>
                  <span className="font-medium" data-testid="summary-ticket-type">
                    {bookingData.ticketType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium" data-testid="summary-ticket-price">
                    {bookingData.paymentMethod === 'credits' ? '5 Credits' : `$${event.price}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">
                    {bookingData.paymentMethod === 'credits' ? 'Credits' : 'Credit Card'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-indigo-600 border-t border-gray-100 pt-2">
                  <span>Total:</span>
                  <span data-testid="summary-total-price">
                    {bookingData.paymentMethod === 'credits' ? '5 Credits' : `$${event.price}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;