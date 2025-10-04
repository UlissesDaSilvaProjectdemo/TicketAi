import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, Loader, XCircle, ArrowLeft, Coins, CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreditsSuccess = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, failed, expired
  const [paymentData, setPaymentData] = useState(null);
  const [creditBalance, setCreditBalance] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId || !user) {
      navigate('/pricing');
      return;
    }

    checkPaymentStatus();
  }, [sessionId, user]);

  const checkPaymentStatus = async () => {
    if (attempts >= 5) {
      setStatus('failed');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/credits/purchase/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      setPaymentData(data);

      if (data.payment_status === 'paid' && data.purchase_status === 'completed') {
        setStatus('success');
        // Fetch updated credit balance
        const balanceResponse = await axios.get(`${API}/credits/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreditBalance(balanceResponse.data);
      } else if (data.status === 'expired') {
        setStatus('expired');
      } else {
        // Payment still pending, continue polling
        setAttempts(prev => prev + 1);
        setTimeout(checkPaymentStatus, 2000);
      }

    } catch (error) {
      console.error('Error checking payment status:', error);
      setAttempts(prev => prev + 1);
      if (attempts >= 4) {
        setStatus('failed');
      } else {
        setTimeout(checkPaymentStatus, 2000);
      }
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This usually takes a few seconds
              </p>
            </CardContent>
          </Card>
        );

      case 'success':
        return (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Payment Successful! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Credits Added Successfully</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium">${paymentData?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Balance:</span>
                    <span className="font-bold text-lg">
                      {creditBalance?.balance} credits
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">What you can do now:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Coins className="w-4 h-4 text-green-500 mr-2" />
                    Book tickets using your credits (5 credits per ticket)
                  </li>
                  <li className="flex items-center">
                    <CreditCard className="w-4 h-4 text-blue-500 mr-2" />
                    Purchase more credits anytime
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  View Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Browse Events
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'failed':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-4">
                We couldn't process your payment. Please try again or contact support.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'expired':
        return (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Session Expired
              </h2>
              <p className="text-gray-600 mb-4">
                Your payment session has expired. Please try purchasing credits again.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="w-full"
                >
                  Buy Credits Again
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default CreditsSuccess;