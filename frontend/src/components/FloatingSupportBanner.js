import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Heart, X, Zap, Star, Coffee, DollarSign, 
  ChevronRight, ChevronLeft, Gift 
} from 'lucide-react';

const FloatingSupportBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenBanner, setHasSeenBanner] = useState(false);

  useEffect(() => {
    // Check if user has seen banner before
    const seen = localStorage.getItem('supportBannerSeen');
    if (!seen) {
      // Auto-expand for first-time visitors after 3 seconds
      const timer = setTimeout(() => {
        setIsExpanded(true);
        localStorage.setItem('supportBannerSeen', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenBanner(true);
    }

    // Check if returning from Stripe payment
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId && window.location.pathname.includes('/donation/success')) {
      handlePaymentSuccess(sessionId);
    }
  }, []);

  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Poll payment status
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/status/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.payment_status === 'paid') {
          alert('🎉 Thank you for your generous support! Your contribution helps us build amazing features.');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleDonation = async (tier) => {
    if (isProcessingPayment) return;

    setIsProcessingPayment(true);
    try {
      const originUrl = window.location.origin;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: tier.packageId,
          origin_url: originUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Sorry, there was an error processing your donation. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCustomDonation = async () => {
    const amount = prompt("Enter custom amount (USD):");
    if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
      if (amount !== null) { // Only show error if user didn't cancel
        alert('Please enter a valid amount of $1 or more.');
      }
      return;
    }

    if (isProcessingPayment) return;

    setIsProcessingPayment(true);
    try {
      const originUrl = window.location.origin;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/donations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custom_amount: parseFloat(amount),
          origin_url: originUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Sorry, there was an error processing your donation. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isVisible) return null;

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const supportTiers = [
    {
      name: "Coffee Supporter",
      amount: "$5",
      packageId: "coffee",
      icon: Coffee,
      color: "from-amber-600 to-orange-600",
      description: "Buy us a coffee!"
    },
    {
      name: "Super Fan",
      amount: "$15",
      packageId: "super",
      icon: Star,
      color: "from-blue-600 to-purple-600",
      description: "Help us grow!"
    },
    {
      name: "Champion",
      amount: "$50",
      packageId: "champion",
      icon: Zap,
      color: "from-purple-600 to-pink-600",
      description: "Supercharge our mission!"
    }
  ];

  return (
    <div className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ${
      isExpanded ? 'right-4' : 'right-0'
    }`}>
      {!isExpanded ? (
        // Collapsed tab
        <div 
          className="bg-gradient-to-b from-pink-600 to-purple-600 text-white p-3 rounded-l-lg shadow-2xl cursor-pointer hover:from-pink-700 hover:to-purple-700 transition-all duration-300 group"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex flex-col items-center space-y-2">
            <Heart className="w-6 h-6 animate-pulse" />
            <div className="text-xs font-bold transform -rotate-90 whitespace-nowrap">
              SUPPORT US
            </div>
            <ChevronLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ) : (
        // Expanded banner
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-pink-500/30 shadow-2xl w-80 animate-slide-in">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Support TicketAI</h3>
                    <p className="text-xs text-pink-100">Help us build the future!</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-300 mb-3">
                  🚀 Love what we're building? Your support helps us create amazing features and keep TicketAI growing!
                </p>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">Special Perks</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>• Early access to new features</li>
                    <li>• Premium support priority</li>
                    <li>• Exclusive supporter badge</li>
                  </ul>
                </div>
              </div>

              {/* Support Tiers */}
              <div className="space-y-2">
                {supportTiers.map((tier, index) => {
                  const IconComponent = tier.icon;
                  return (
                    <Button
                      key={index}
                      className={`w-full bg-gradient-to-r ${tier.color} hover:scale-105 transition-all duration-200 p-3 h-auto`}
                      onClick={() => {
                        // This would integrate with payment processing
                        window.open(`https://donate.stripe.com/example?amount=${tier.amount.replace('$', '')}00`, '_blank');
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-semibold text-sm">{tier.name}</div>
                            <div className="text-xs opacity-90">{tier.description}</div>
                          </div>
                        </div>
                        <div className="font-bold text-lg">{tier.amount}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Custom Amount */}
              <div className="pt-2 border-t border-slate-700">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    const amount = prompt("Enter custom amount (USD):");
                    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                      window.open(`https://donate.stripe.com/example?amount=${Math.round(parseFloat(amount) * 100)}`, '_blank');
                    }
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Custom Amount
                </Button>
              </div>

              {/* Close options */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white text-xs"
                  onClick={() => setIsVisible(false)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Hide
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-slate-400 hover:text-white text-xs"
                  onClick={() => {
                    localStorage.setItem('supportBannerDismissed', Date.now().toString());
                    setIsVisible(false);
                  }}
                >
                  Remind Later
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloatingSupportBanner;