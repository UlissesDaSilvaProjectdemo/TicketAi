import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Play, Home, ArrowLeft, Video } from 'lucide-react';

const StreamSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [streamDetails, setStreamDetails] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/live-streaming');
      return;
    }

    checkPaymentStatus(sessionId);
  }, [searchParams, navigate]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      // In a real implementation, this would check the stream purchase status
      // For now, we'll simulate a successful purchase
      setTimeout(() => {
        setPaymentStatus('success');
        setStreamDetails({
          title: 'Arctic Monkeys - Live from Studio',
          artist: 'Arctic Monkeys',
          price: 19.99,
          accessType: 'Pay-per-view',
          streamDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      }, 2000);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <Card className="bg-slate-900/50 border-slate-700 max-w-md w-full">
        <CardContent className="p-8 text-center">
          {paymentStatus === 'checking' && (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-white mb-4">Processing Your Purchase</h1>
              <p className="text-slate-400">Please wait while we confirm your stream access...</p>
            </>
          )}

          {paymentStatus === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-600/20 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Stream Access Confirmed! 🎬</h1>
              <p className="text-lg text-slate-300 mb-6">
                Your stream access has been successfully activated!
              </p>
              
              {streamDetails && (
                <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Stream:</span>
                    <span className="text-white font-semibold">{streamDetails.title}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Artist:</span>
                    <span className="text-white">{streamDetails.artist}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Access Type:</span>
                    <span className="text-blue-400">{streamDetails.accessType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="text-white font-semibold">${streamDetails.price}</span>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Video className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-400">What's Next?</span>
                </div>
                <p className="text-sm text-slate-300">
                  Your access is ready! You can now watch the stream when it goes live. 
                  Check your email for access instructions and reminders.
                </p>
              </div>
            </>
          )}

          {paymentStatus === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-600/20 rounded-full">
                  <Video className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Payment Status Unknown</h1>
              <p className="text-slate-400 mb-6">
                We couldn't verify your stream purchase. If you were charged, 
                please check your email for confirmation or contact support.
              </p>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate('/live-streaming')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Streams
            </Button>
            {paymentStatus === 'success' && (
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => navigate('/live-streaming')}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Streams
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamSuccess;