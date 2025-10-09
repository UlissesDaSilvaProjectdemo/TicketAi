import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Heart, Home, ArrowLeft } from 'lucide-react';

const DonationSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/');
      return;
    }

    checkPaymentStatus(sessionId);
  }, [searchParams, navigate]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      let attempts = 0;
      const maxAttempts = 5;
      const pollInterval = 2000; // 2 seconds

      const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          setPaymentStatus('timeout');
          return;
        }

        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/status/${sessionId}`);
          
          if (!response.ok) {
            throw new Error('Failed to check payment status');
          }

          const data = await response.json();
          
          if (data.payment_status === 'paid') {
            setPaymentStatus('success');
            setPaymentDetails(data);
            return;
          } else if (data.status === 'expired') {
            setPaymentStatus('expired');
            return;
          }

          // If payment is still pending, continue polling
          attempts++;
          setTimeout(pollStatus, pollInterval);
          
        } catch (error) {
          console.error('Error checking payment status:', error);
          setPaymentStatus('error');
        }
      };

      pollStatus();
      
    } catch (error) {
      console.error('Error initializing payment check:', error);
      setPaymentStatus('error');
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="bg-slate-900/50 border-slate-700 max-w-md w-full">
        <CardContent className="p-8 text-center">
          {paymentStatus === 'checking' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-white mb-4">Processing Your Payment</h1>
              <p className="text-slate-400">Please wait while we confirm your donation...</p>
            </>
          )}

          {paymentStatus === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-600/20 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Thank You! 🎉</h1>
              <p className="text-lg text-slate-300 mb-6">
                Your generous donation has been successfully processed!
              </p>
              
              {paymentDetails && (
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-white font-semibold">
                      {formatAmount(paymentDetails.amount_total, paymentDetails.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-slate-500 text-sm font-mono">
                      {paymentDetails.metadata?.session_id?.slice(-8) || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className="font-semibold text-pink-400">Your Impact</span>
                </div>
                <p className="text-sm text-slate-300">
                  Your support helps us build better AI features, improve user experience, 
                  and keep TicketAI growing. Thank you for being part of our journey!
                </p>
              </div>
            </>
          )}

          {paymentStatus === 'expired' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-yellow-600/20 rounded-full">
                  <Heart className="w-12 h-12 text-yellow-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Payment Session Expired</h1>
              <p className="text-slate-400 mb-6">
                Your payment session has expired. Please try your donation again.
              </p>
            </>
          )}

          {paymentStatus === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-600/20 rounded-full">
                  <Heart className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Payment Status Unknown</h1>
              <p className="text-slate-400 mb-6">
                We couldn't verify your payment status. If you were charged, 
                please check your email for a receipt or contact support.
              </p>
            </>
          )}

          {paymentStatus === 'timeout' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-orange-600/20 rounded-full">
                  <Heart className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Verification Timeout</h1>
              <p className="text-slate-400 mb-6">
                Payment verification is taking longer than expected. 
                Please check your email for confirmation or try refreshing the page.
              </p>
            </>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationSuccess;