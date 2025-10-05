import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  CreditCard, Lock, CheckCircle, AlertCircle, 
  ArrowLeft, ShoppingCart, Calendar, MapPin
} from 'lucide-react';

const DemoPaymentPage = () => {
  const navigate = useNavigate();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentComplete(true);
    }, 3000);
  };

  if (paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 min-h-screen flex items-center">
        <Card className="w-full text-center">
          <CardHeader>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Summer Music Festival 2025</h3>
              <p className="text-green-600">July 15, 2025 at 7:00 PM</p>
              <p className="text-green-600">Central Park, New York, NY</p>
              <p className="text-green-800 font-semibold">1 ticket - $90.00</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Confirmation email sent</p>
              <p>Booking ID: BK-{Date.now()}</p>
            </div>
            <div className="space-y-2 pt-4">
              <Button onClick={() => navigate('/')} className="w-full btn-primary">
                Browse More Events
              </Button>
              <Button onClick={() => setPaymentComplete(false)} variant="outline" className="w-full">
                Test Another Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <div className="mb-6">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Demo Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150"
                  alt="Event"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">Summer Music Festival 2025</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      July 15, 2025 at 7:00 PM
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Central Park, New York, NY
                    </div>
                  </div>
                  <Badge className="mt-2">Music</Badge>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>1x General Admission</span>
                  <span>$85.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>$90.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Details
                </span>
                <div className="text-2xl font-bold text-indigo-600">$90.00</div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Demo Payment Form</span>
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

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Order Total</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subtotal</span>
                  <span>$85.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Service fee</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>$90.00</span>
                </div>
              </div>

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

              <div className="flex items-center justify-center text-xs text-gray-500">
                <Lock className="w-3 h-3 mr-1" />
                Secured by 256-bit SSL encryption
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Test Card Details:</p>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono mt-2">
                  <div>Card: 6565 6587 8789 9000</div>
                  <div>Expiry: 09/27</div>
                  <div>CVV: 678</div>
                  <div>Name: Ulisses Da Silva</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentPage;