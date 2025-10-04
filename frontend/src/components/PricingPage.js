import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Check, Zap, Sparkles, TrendingUp, Shield, Clock, 
  CreditCard, Star, ArrowRight, Phone, Mail, DollarSign,
  Search, Database, BarChart3, Settings
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PricingPage = () => {
  const { user, setShowAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const creditPacks = [
    {
      id: 'small',
      name: 'Small Pack',
      price: 10,
      credits: 100,
      searches: 100,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      features: [
        '100 credits for ticket bookings',
        '20 ticket bookings (5 credits each)',
        'Basic event filtering',
        'Email support',
        '12-month credit validity',
        'API access'
      ]
    },
    {
      id: 'medium',
      name: 'Medium Pack',
      price: 40,
      credits: 500,
      searches: 500,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      savings: 10,
      features: [
        '500 credits for ticket bookings',
        '100 ticket bookings (5 credits each)',
        'Advanced filtering & sorting',
        'Priority email support',
        '12-month credit validity',
        'Full API access',
        'Usage analytics',
        'Custom integrations'
      ]
    },
    {
      id: 'large',
      name: 'Large Pack',
      price: 70,
      credits: 1000,
      searches: 1000,
      color: 'from-emerald-500 to-teal-500',
      popular: false,
      savings: 30,
      features: [
        '1000 credits for ticket bookings',
        '200 ticket bookings (5 credits each)',
        'All advanced features',
        'Priority support + phone',
        '12-month credit validity',
        'Full API access',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager'
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: Sparkles,
      title: 'Smart AI Search',
      description: 'Natural language understanding powered by OpenAI for accurate event discovery'
    },
    {
      icon: Database,
      title: 'Live Data Integration',
      description: 'Real-time integration with Ticketmaster and premium event providers'
    },
    {
      icon: TrendingUp,
      title: 'Boost Conversions',
      description: 'More relevant results mean higher conversions and happier customers'
    },
    {
      icon: Settings,
      title: 'Easy Integration',
      description: 'Simple APIs and low-code platform integration via Emergent.sh'
    },
    {
      icon: Shield,
      title: 'Scalable & Secure',
      description: 'Enterprise-grade infrastructure supporting business growth'
    },
    {
      icon: BarChart3,
      title: 'Analytics Insights',
      description: 'Track usage, performance, and optimization opportunities'
    }
  ];

  const handlePurchaseCredits = async (pack) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(pack.id);

    try {
      const response = await axios.post(`${API}/credits/purchase`, {
        pack_id: pack.id,
        amount: pack.price * 100, // Convert to cents
        credits: pack.credits,
        success_url: `${window.location.origin}/credits/success`,
        cancel_url: `${window.location.origin}/pricing`
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      alert('There was an error processing your purchase. Please try again.');
    } finally {
      setLoading('');
    }
  };

  const handleFreeTrial = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading('free');

    try {
      await axios.post(`${API}/credits/free-trial`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      alert('🎉 Free trial activated! You now have 500 free searches.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error activating free trial:', error);
      alert('Free trial could not be activated. You may have already used your free trial.');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge className="bg-indigo-100 text-indigo-800 px-4 py-2 text-lg">
              ⚡ Pay-As-You-Go Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>
              Buy Credits,
              <span className="text-gradient block">Use Anytime</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Prefer flexibility? Buy credits and pay only for what you use. Perfect for startups 
              and businesses with fluctuating search volumes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">500</div>
              <div className="text-sm text-gray-600">Free Trial Searches</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">12</div>
              <div className="text-sm text-gray-600">Months Validity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">0</div>
              <div className="text-sm text-gray-600">Monthly Commitment</div>
            </div>
          </div>
        </div>

        {/* Credit Packs */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Credit Pack</h2>
            <p className="text-gray-600">No monthly commitment • Credits roll over for 12 months • Cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {creditPacks.map((pack, index) => (
              <Card 
                key={pack.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  pack.popular ? 'ring-2 ring-purple-500 shadow-xl' : ''
                }`}
                data-testid={`credit-pack-${pack.id}`}
              >
                {pack.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                      🏆 MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className={`h-2 bg-gradient-to-r ${pack.color}`}></div>
                
                <CardHeader className={`text-center ${pack.popular ? 'pt-8' : 'pt-6'}`}>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {pack.name}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      ${pack.price}
                    </div>
                    <div className="text-gray-600">
                      {pack.searches.toLocaleString()} searches included
                    </div>
                    {pack.savings && (
                      <Badge className="bg-green-100 text-green-800">
                        Save ${pack.savings}!
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-center">
                    ${(pack.price / pack.searches).toFixed(3)} per search
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {pack.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePurchaseCredits(pack)}
                    disabled={loading === pack.id}
                    className={`w-full py-3 text-lg font-semibold bg-gradient-to-r ${pack.color} text-white hover:shadow-lg transition-all duration-200`}
                    data-testid={`buy-credits-${pack.id}`}
                  >
                    {loading === pack.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Buy Credits
                      </>
                    )}
                  </Button>

                  {pack.popular && (
                    <div className="text-center text-sm text-purple-600 font-medium">
                      ⚡ Best value for growing businesses
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Free Trial CTA */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Try Before You Buy</h3>
                <p className="text-green-100 text-lg">
                  Get 500 free searches with no credit card required
                </p>
                <Button
                  onClick={handleFreeTrial}
                  disabled={loading === 'free'}
                  className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3"
                  data-testid="free-trial-btn"
                >
                  {loading === 'free' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2" />
                      Activating...
                    </div>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose TicketAI */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TicketAI?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Built for developers and businesses who need powerful, accurate event search capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Integration Preview */}
        <Card className="bg-gray-50 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy API Integration</h3>
              <p className="text-gray-600">Get started in minutes with our simple REST API</p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 ml-2">TicketAI API</span>
              </div>
              <pre className="text-xs md:text-sm leading-relaxed">
{`curl -X POST "https://api.ticketai.com/search" \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "rock concerts this weekend",
    "location": "New York",
    "max_results": 10
  }'

// Response
{
  "events": [...],
  "ai_analysis": "Found 8 rock concerts...",
  "credits_used": 1,
  "credits_remaining": 499
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Custom Plans CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Need a Custom Plan?</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Have unique needs or want to scale quickly? We offer custom pricing and dedicated support for enterprise clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3">
                <Phone className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3">
                <Mail className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </div>
            
            <div className="text-indigo-200 text-sm">
              💼 Volume discounts available • 🚀 White-label options • 🔒 Enterprise security
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "How do credits work?",
                answer: "Each AI search uses 1 credit. Credits are deducted only when you perform searches, not for browsing or viewing results."
              },
              {
                question: "Do credits expire?",
                answer: "Credits are valid for 12 months from the purchase date. They automatically roll over so you never lose unused credits."
              },
              {
                question: "Can I upgrade or buy more credits anytime?",
                answer: "Yes! You can purchase additional credit packs anytime. Credits from different purchases stack together."
              },
              {
                question: "Is there an API rate limit?",
                answer: "No strict rate limits, but we monitor for abuse. Enterprise plans include dedicated rate limits and priority processing."
              },
              {
                question: "What data sources do you use?",
                answer: "We integrate with Ticketmaster, local event providers, and maintain our own curated database of verified events."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of developers building better event discovery experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleFreeTrial}
              className="btn-primary px-8 py-3 text-lg"
              data-testid="footer-free-trial"
            >
              Start Free Trial
            </Button>
            <Button 
              onClick={() => document.querySelector('[data-testid="credit-pack-medium"]').scrollIntoView()}
              variant="outline"
              className="px-8 py-3 text-lg"
              data-testid="footer-buy-credits"
            >
              Buy Credits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;