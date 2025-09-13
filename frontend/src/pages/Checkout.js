import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { 
  Ticket, ArrowLeft, CreditCard, Shield, Calendar, MapPin, Users, CheckCircle 
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkoutData, setCheckoutData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Get checkout data from localStorage
    const data = localStorage.getItem('checkoutData');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      navigate('/events');
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      // Generate mock ticket data
      const ticketData = {
        ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        eventName: checkoutData.eventName,
        ticketType: checkoutData.ticketType,
        quantity: checkoutData.quantity,
        totalPrice: checkoutData.price * checkoutData.quantity,
        purchaseDate: new Date().toISOString(),
        qrCode: `QR-${Date.now()}`,
        customerName: paymentData.name,
        customerEmail: paymentData.email
      };

      // Store ticket data for success page
      localStorage.setItem('purchaseSuccess', JSON.stringify(ticketData));
      localStorage.removeItem('checkoutData');
      
      setIsProcessing(false);
      navigate('/success');
    }, 3000);
  };

  const formatCardNumber = (value) => {
    // Format card number with spaces
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    // Format expiry date as MM/YY
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const totalAmount = checkoutData.price * checkoutData.quantity;
  const serviceFee = Math.round(totalAmount * 0.08);
  const grandTotal = totalAmount + serviceFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => navigate(`/event/${checkoutData.eventId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event
              </Button>
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">TicketAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
              <p className="text-slate-300">Complete your ticket purchase</p>
            </div>

            {/* Customer Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={paymentData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={paymentData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    value={paymentData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Your payment information is encrypted and secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-slate-200">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-slate-200">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-slate-200">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Button */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              onClick={handlePayment}
              disabled={isProcessing || !paymentData.name || !paymentData.email || !paymentData.cardNumber}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Complete Purchase - ${grandTotal.toLocaleString()}
                </>
              )}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-lg">{checkoutData.eventName}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>Event Date & Time</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span>Venue Location</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Users className="h-4 w-4" />
                      <span>{checkoutData.ticketType} - {checkoutData.quantity} ticket{checkoutData.quantity > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-600" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Tickets ({checkoutData.quantity}x ${checkoutData.price})</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Service Fee</span>
                    <span>${serviceFee.toLocaleString()}</span>
                  </div>
                  
                  <Separator className="bg-slate-600" />
                  
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total</span>
                    <span>${grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Your purchase includes:</span>
                  </div>
                  <ul className="text-sm text-slate-300 space-y-1 ml-7">
                    <li>• Blockchain-verified digital tickets</li>
                    <li>• QR code for easy venue entry</li>
                    <li>• Mobile wallet integration</li>
                    <li>• 24/7 customer support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;