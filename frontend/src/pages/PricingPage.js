import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, CheckCircle, ArrowLeft, Zap, Shield, Users, BarChart3,
  Crown, Building, Smartphone, Globe, Headphones, Award, Phone,
  Mail, DollarSign, Star, Code, TrendingUp, Gift, Calculator
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

  // Remove yearly plans as we're focusing on credits and subscriptions

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      title: "AI-Powered Predictions",
      description: "Machine learning algorithms with 94% accuracy"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: "Blockchain Security",
      description: "Every transaction verified and protected"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-blue-500" />,
      title: "Mobile Trading",
      description: "Trade on-the-go with our mobile app"
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      title: "Global Markets",
      description: "Access events worldwide in 50+ countries"
    },
    {
      icon: <Headphones className="h-6 w-6 text-pink-500" />,
      title: "24/7 Support",
      description: "Round-the-clock customer assistance"
    },
    {
      icon: <Award className="h-6 w-6 text-orange-500" />,
      title: "Web Summit Winner",
      description: "Award-winning platform trusted by thousands"
    }
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments. Enterprise customers can also pay via bank transfer or purchase orders."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Pro Trader plans come with a 14-day free trial. No credit card required to start, and you can cancel anytime during the trial period."
    },
    {
      question: "How accurate are the AI predictions?",
      answer: "Our AI models achieve 94% accuracy in price prediction across all event types. We continuously train our models on real market data and user behavior patterns."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll provide a full refund with no questions asked."
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
          <Badge className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400 mb-6">
            <Award className="w-4 h-4 mr-2" />
            14-Day Free Trial Available
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
            Choose the plan that fits your trading style. Start free, upgrade when you're ready to scale.
          </p>

          {/* Billing Toggle */}
          <Tabs value={billingCycle} onValueChange={setBillingCycle} className="w-fit mx-auto">
            <TabsList className="bg-slate-800 border-slate-700 p-2">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-slate-700 text-white px-8 py-2">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="data-[state=active]:bg-slate-700 text-white px-8 py-2">
                Yearly
                <Badge className="ml-2 bg-green-600 text-white text-xs">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {currentPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.popular 
                  ? 'border-purple-500 bg-slate-900/70 ring-2 ring-purple-500/20' 
                  : 'bg-slate-900/50 border-slate-700'
              } transition-all duration-300 hover:scale-105 ${plan.highlight ? 'transform scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center p-8 pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-slate-800/50 rounded-2xl">
                    {plan.icon}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="text-5xl font-bold text-white">
                      {plan.price}
                    </div>
                    {plan.originalPrice && (
                      <div className="text-lg text-slate-400 line-through">
                        {plan.originalPrice}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-slate-400">
                    {billingCycle === 'monthly' ? 'per month' : 'per year'}
                  </div>
                  
                  {plan.savings && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
                
                <CardDescription className="text-slate-400 text-lg">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 p-8 pt-4">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-sm uppercase tracking-wide">
                    What's Included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full py-6 text-lg ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.cta}
                </Button>
                
                <p className="text-center text-xs text-slate-500">
                  {plan.name === "Starter" 
                    ? "No credit card required" 
                    : plan.name === "Enterprise" 
                    ? "Custom implementation included"
                    : "Cancel anytime, no questions asked"
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            All Plans Include These Core Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-slate-900/30 rounded-xl border border-slate-800">
                <div className="p-2 bg-slate-800/50 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
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

        {/* Enterprise CTA */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700 p-12 text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white">Need a Custom Solution?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              We work with event promoters, venues, and large organizations to create tailored solutions that fit your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                onClick={() => navigate('/contact')}
              >
                Contact Sales Team
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
                onClick={() => navigate('/events')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PricingPage;