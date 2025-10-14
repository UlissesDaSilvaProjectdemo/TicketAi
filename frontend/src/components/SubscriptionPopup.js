import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Mail, User, Phone, Gift, Ticket, Crown, Zap, CheckCircle } from 'lucide-react';

const SubscriptionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+44'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user has already subscribed
    const hasSubscribed = localStorage.getItem('ticketai_subscribed');
    
    if (!hasSubscribed) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country_code: formData.countryCode,
          source: 'popup'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      const data = await response.json();
      
      // Mark as subscribed in localStorage
      localStorage.setItem('ticketai_subscribed', 'true');
      
      // Show success message
      setShowSuccess(true);
      
      // Close popup after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);

    } catch (error) {
      console.error('Subscription error:', error);
      alert('Sorry, there was an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  const countryCodes = [
    { code: '+44', name: 'UK' },
    { code: '+1', name: 'US/CA' },
    { code: '+91', name: 'IN' },
    { code: '+61', name: 'AU' },
    { code: '+971', name: 'AE' },
    { code: '+33', name: 'FR' },
    { code: '+49', name: 'DE' },
    { code: '+34', name: 'ES' },
    { code: '+39', name: 'IT' },
    { code: '+81', name: 'JP' },
    { code: '+86', name: 'CN' },
    { code: '+52', name: 'MX' },
    { code: '+55', name: 'BR' },
    { code: '+27', name: 'ZA' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <Card className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border-2 border-pink-500/40 shadow-2xl w-full max-w-md pointer-events-auto animate-scale-in">
          <CardContent className="p-0">
            {!showSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-t-lg relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:bg-white/20 h-8 w-8 p-0"
                    onClick={handleClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Join the VIP Community!
                    </h2>
                    <p className="text-pink-100 text-sm">
                      Get exclusive access to the best events
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="p-6 space-y-4">
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-pink-400" />
                      Member Benefits
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start">
                        <Ticket className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Exclusive coupons & discounts on tickets</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0 mt-0.5" />
                        <span>Early access to latest events & concerts</span>
                      </li>
                      <li className="flex items-start">
                        <Crown className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Priority VIP ticket access</span>
                      </li>
                      <li className="flex items-start">
                        <Mail className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span>Personalized event recommendations</span>
                      </li>
                    </ul>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                          className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                          required
                        />
                      </div>
                    </div>

                    {/* WhatsApp/Phone Input */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        WhatsApp Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                        >
                          {countryCodes.map(country => (
                            <option key={country.code} value={country.code}>
                              {country.code} {country.name}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="123456789"
                            className="w-full pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Subscribing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Crown className="w-4 h-4 mr-2" />
                          Join VIP Community
                        </span>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-slate-500 text-center mt-3">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </div>
              </>
            ) : (
              /* Success Message */
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 animate-bounce-in">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Welcome to the VIP Club!
                </h3>
                <p className="text-slate-300 mb-4">
                  You're now part of our exclusive community.
                </p>
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-purple-200">
                    🎉 Check your email for your welcome gift and exclusive discount code!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

export default SubscriptionPopup;
