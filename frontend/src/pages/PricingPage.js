import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, CheckCircle, ArrowLeft, Zap, Shield, Users, BarChart3,
  Phone, Mail, Star, Code, TrendingUp, Globe, Crown, Gift, Calculator
} from 'lucide-react';

const PricingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('credits');

  const subscriptionPlans = [
    {
      name: "Basic Subscription",
      price: "$50",
      period: "per month",
      description: "Unlimited searches included",
      features: [
        "Unlimited AI-powered searches",
        "Advanced event filtering", 
        "Priority email support",
        "API access",
        "Analytics dashboard"
      ],
      cta: "Coming Soon",
      popular: false,
      available: false
    },
    {
      name: "Pro Subscription",
      price: "$300", 
      period: "per month",
      description: "Unlimited searches included",
      features: [
        "Unlimited AI-powered searches",
        "Advanced filtering & sorting",
        "Priority support + phone",
        "Full API access",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager"
      ],
      cta: "Coming Soon",
      popular: true,
      available: false
    },
    {
      name: "Enterprise Plan",
      price: "Custom",
      period: "contact us",
      description: "Tailored to your needs",
      features: [
        "Unlimited everything",
        "White-label options",
        "Custom integrations", 
        "Dedicated infrastructure",
        "SLA guarantees",
        "On-premise deployment",
        "Custom billing"
      ],
      cta: "Contact Sales",
      popular: false,
      available: true
    }
  ];

  const creditPacks = [
    {
      name: "Starter Pack",
      price: "$9.99",
      searches: "100 searches included",
      perSearch: "$0.100 per search",
      features: [
        "100 AI-powered searches",
        "Advanced event filtering",
        "Email support",
        "12-month credit validity",
        "API access"
      ],
      badge: "🆓 FREE TRIAL OPTION",
      badgeColor: "bg-green-600"
    },
    {
      name: "Quick Top-up", 
      price: "$1",
      searches: "5 searches included",
      perSearch: "$0.200 per search",
      features: [
        "5 AI-powered searches",
        "Perfect for testing",
        "Instant activation"
      ],
      badge: "⚡ TEST PACKAGE",
      badgeColor: "bg-amber-600"
    },
    {
      name: "Basic Pack",
      price: "$20",
      searches: "100 searches included", 
      perSearch: "$0.200 per search",
      features: [
        "100 AI-powered searches",
        "Advanced event filtering",
        "Email support",
        "12-month credit validity",
        "API access"
      ],
      badge: null,
      badgeColor: ""
    },
    {
      name: "Value Pack",
      price: "$50",
      searches: "250 searches included",
      perSearch: "$0.200 per search", 
      features: [
        "250 AI-powered searches",
        "Advanced filtering & sorting",
        "Priority email support",
        "12-month credit validity",
        "Full API access",
        "Usage analytics"
      ],
      badge: "🏆 MOST POPULAR",
      badgeColor: "bg-purple-600"
    },
    {
      name: "Premium Pack",
      price: "$100",
      searches: "500 searches included",
      perSearch: "$0.200 per search",
      features: [
        "500 AI-powered searches",
        "All premium features",
        "Priority support",
        "12-month credit validity", 
        "Full API access",
        "Advanced analytics",
        "Custom integrations"
      ],
      badge: "⚡ Best value for regular users",
      badgeColor: "bg-blue-600"
    },
    {
      name: "Business Bundle",
      price: "$500",
      searches: "2,500 credits→ 3,000 credits",
      searchCount: "3,000 searches included",
      perSearch: "$0.167 per search",
      savings: "Save $100!",
      features: [
        "3,000 AI-powered searches",
        "20% bonus credits (2,500 + 500 free)",
        "Business-grade support",
        "12-month credit validity",
        "Full API access", 
        "Advanced analytics",
        "Custom integrations",
        "Priority processing"
      ],
      badge: "🎁 20% BONUS",
      badgeColor: "bg-red-600"
    },
    {
      name: "Enterprise Bundle",
      price: "$1,000", 
      searches: "5,000 credits→ 6,000 credits",
      searchCount: "6,000 searches included",
      perSearch: "$0.167 per search",
      savings: "Save $200!",
      features: [
        "6,000 AI-powered searches",
        "20% bonus credits (5,000 + 1,000 free)",
        "Enterprise-grade support",
        "12-month credit validity",
        "Full API access",
        "Advanced analytics", 
        "Custom integrations",
        "Dedicated account manager",
        "Priority processing"
      ],
      badge: "🎁 Best value bundle",
      badgeColor: "bg-red-600"
    }
  ];

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: "Smart AI Search",
      description: "Natural language understanding powered by OpenAI for accurate event discovery"
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" />,
      title: "Live Data Integration", 
      description: "Real-time integration with Ticketmaster and premium event providers"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: "Boost Conversions",
      description: "More relevant results mean higher conversions and happier customers"
    },
    {
      icon: <Code className="h-8 w-8 text-amber-500" />,
      title: "Easy Integration",
      description: "Simple APIs and low-code platform integration via Emergent.sh"
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Scalable & Secure", 
      description: "Enterprise-grade infrastructure supporting business growth"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-pink-500" />,
      title: "Analytics Insights",
      description: "Track usage, performance, and optimization opportunities"
    }
  ];

  const faqs = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ⚡ Pay-As-You-Go Pricing
          </h1>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Buy Credits, Use Anytime
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Prefer flexibility? Buy credits and pay only for what you use. Perfect for startups and businesses with fluctuating search volumes.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">100</div>
                <div className="text-slate-400">Free Trial Searches</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">12</div>
                <div className="text-slate-400">Months Validity</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">0</div>
                <div className="text-slate-400">Monthly Commitment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-slate-800 border-slate-700 p-2">
              <TabsTrigger value="credits" className="data-[state=active]:bg-slate-700 text-white px-8 py-3">
                Pay-As-You-Go
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="data-[state=active]:bg-slate-700 text-white px-8 py-3">
                Subscriptions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Subscription Plans */}
          <TabsContent value="subscriptions" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Subscription Plans</h2>
              <p className="text-xl text-slate-400">Unlimited searches • Priority support • Advanced features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {subscriptionPlans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${
                    plan.popular 
                      ? 'border-purple-500 bg-slate-900/70 ring-2 ring-purple-500/20' 
                      : 'bg-slate-900/50 border-slate-700'
                  } transition-all duration-300 hover:scale-105`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2">
                        🏆 MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center p-8">
                    <CardTitle className="text-2xl font-bold text-white mb-4">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-5xl font-bold text-white">
                        {plan.price}
                      </div>
                      <div className="text-slate-400">{plan.period}</div>
                      <p className="text-slate-300 font-medium">{plan.description}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 p-8 pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full py-6 text-lg ${
                        plan.available
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!plan.available}
                      onClick={() => plan.available && navigate('/contact')}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pay-As-You-Go Credits */}
          <TabsContent value="credits" className="space-y-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Pay-As-You-Go Credits</h2>
              <p className="text-xl text-slate-400">No monthly commitment • Credits roll over for 12 months • Buy exactly what you need</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creditPacks.map((pack, index) => (
                <Card 
                  key={index} 
                  className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="text-center p-6 pb-4">
                    {pack.badge && (
                      <Badge className={`${pack.badgeColor} text-white mb-4 text-xs`}>
                        {pack.badge}
                      </Badge>
                    )}
                    <CardTitle className="text-xl font-bold text-white mb-2">{pack.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white">{pack.price}</div>
                      <div className="text-slate-400 text-sm">{pack.searches}</div>
                      {pack.searchCount && (
                        <div className="text-slate-300 text-sm font-medium">{pack.searchCount}</div>
                      )}
                      {pack.savings && (
                        <Badge className="bg-green-600 text-white">{pack.savings}</Badge>
                      )}
                      <div className="text-slate-400 text-xs">{pack.perSearch}</div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 p-6 pt-2">
                    <ul className="space-y-2">
                      {pack.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4"
                      onClick={() => navigate('/auth')}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Free Trial CTA */}
        <div className="text-center my-20">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700 p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Try Before You Buy</h3>
            <p className="text-xl text-slate-300 mb-8">
              Get 100 free searches with no credit card required
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-12 py-6"
              onClick={() => navigate('/events')}
            >
              Start Free Trial
            </Button>
          </Card>
        </div>

        {/* Why Choose TicketAI */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Why Choose TicketAI?</h2>
          <p className="text-xl text-slate-400 text-center mb-12 max-w-3xl mx-auto">
            Built for developers and businesses who need powerful, accurate event search capabilities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-slate-900/30 rounded-xl border border-slate-800">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Integration */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Easy API Integration</h2>
          <p className="text-xl text-slate-400 text-center mb-12">
            Get started in minutes with our simple REST API
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">TicketAI API</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-800 p-6 rounded-lg overflow-x-auto text-sm">
                  <code className="text-green-400">
{`curl -X POST "https://api.ticketai.com/search" \\
  -H "Authorization: Bearer your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "rock concerts this weekend",
    "location": "New York", 
    "max_results": 10
  }'`}
                  </code>
                </pre>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-800 p-6 rounded-lg overflow-x-auto text-sm">
                  <code className="text-blue-400">
{`// Response
{
  "events": [...],
  "ai_analysis": "Found 8 rock concerts...",
  "credits_used": 1,
  "credits_remaining": 499
}`}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Custom Plan CTA */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-slate-700 p-12 text-center">
            <h3 className="text-4xl font-bold text-white mb-4">Need a Custom Plan?</h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Have unique needs or want to scale quickly? We offer custom pricing and dedicated support for enterprise clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-6"
                onClick={() => navigate('/contact')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Schedule Call
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
                onClick={() => navigate('/contact')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-400 text-sm mt-8">
              <span>💼 Volume discounts available</span>
              <span>🚀 White-label options</span>
              <span>🔒 Enterprise security</span>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">{faq.question}</h3>
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers building better event discovery experiences
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-12 py-6"
              onClick={() => navigate('/events')}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xl px-12 py-6"
              onClick={() => navigate('/auth')}
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