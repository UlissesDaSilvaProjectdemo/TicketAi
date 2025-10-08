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
  const [billingCycle, setBillingCycle] = useState('monthly');

  const monthlyPlans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for casual event-goers",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      features: [
        "Browse all events",
        "Basic price alerts",
        "Community access", 
        "5 transactions/month",
        "Email support"
      ],
      limitations: [
        "Limited AI insights",
        "No priority support"
      ],
      cta: "Get Started Free",
      popular: false,
      highlight: false
    },
    {
      name: "Pro Trader",
      price: "$29",
      originalPrice: "$39",
      description: "For serious ticket investors",
      icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
      features: [
        "Unlimited transactions",
        "Advanced AI predictions",
        "Real-time market alerts",
        "Portfolio analytics",
        "Priority support",
        "Early event access",
        "Custom price alerts",
        "Mobile app access"
      ],
      limitations: [],
      cta: "Start 14-Day Free Trial",
      popular: true,
      highlight: true
    },
    {
      name: "Enterprise",
      price: "$299",
      description: "For event promoters & venues",
      icon: <Building className="h-8 w-8 text-amber-500" />,
      features: [
        "White-label solution",
        "API access & webhooks", 
        "Custom integrations",
        "Dedicated account manager",
        "Advanced reporting & analytics",
        "Bulk operations",
        "Custom branding",
        "SLA guarantees",
        "Training & onboarding"
      ],
      limitations: [],
      cta: "Contact Sales Team",
      popular: false,
      highlight: false
    }
  ];

  const yearlyPlans = monthlyPlans.map(plan => ({
    ...plan,
    price: plan.name === "Starter" ? "$0" : 
           plan.name === "Pro Trader" ? "$290" : "$2,990",
    originalPrice: plan.name === "Pro Trader" ? "$348" : "$3,588",
    savings: plan.name === "Pro Trader" ? "Save $58" : "Save $598"
  }));

  const currentPlans = billingCycle === 'monthly' ? monthlyPlans : yearlyPlans;

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