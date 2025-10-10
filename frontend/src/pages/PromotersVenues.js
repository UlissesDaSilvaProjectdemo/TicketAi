import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  BarChart3, Users, DollarSign, TrendingUp, Zap, 
  Calendar, Video, Mail, Target, Shield, CheckCircle,
  ArrowRight, Star, Globe, Ticket, CreditCard, Eye
} from 'lucide-react';

const PromotersVenues = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Centralized Event Control",
      description: "Create, edit and clone events; manage tickets and streams from one dashboard.",
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "AI Insights & Targeting",
      description: "Audience analytics, trending predictions and promotion suggestions powered by AI.",
      color: "text-purple-400"
    },
    {
      icon: Video,
      title: "Streaming & Hybrid Events",
      description: "Host live streams, offer PPV access, and monetize replays for global reach.",
      color: "text-red-400"
    },
    {
      icon: CreditCard,
      title: "Payments & Payouts",
      description: "Stripe Connect integration with automated payouts and reconciliation.",
      color: "text-green-400"
    }
  ];

  const benefits = [
    {
      category: "Revenue Growth",
      items: [
        "Multiple revenue streams: tickets, streams, tips, sponsors",
        "AI-optimized pricing recommendations",
        "Global audience reach through streaming",
        "Automated upselling and cross-selling"
      ]
    },
    {
      category: "Audience Intelligence",
      items: [
        "Detailed demographic and behavior analytics",
        "Predictive insights for future events",
        "Customer journey mapping and optimization",
        "Retention and engagement scoring"
      ]
    },
    {
      category: "Marketing Automation",
      items: [
        "AI-powered campaign optimization",
        "Automated email sequences and notifications",
        "Social media integration and promotion",
        "Referral and loyalty program management"
      ]
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Up to 3 events per month",
        "Basic analytics dashboard",
        "Standard support",
        "10% transaction fee"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$79",
      description: "For growing promoters",
      features: [
        "Unlimited events",
        "Advanced analytics & AI insights",
        "Priority support",
        "5% transaction fee",
        "Email marketing tools",
        "Live streaming included"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large venues & organizations",
      features: [
        "White-label dashboard",
        "API access & integrations",
        "Dedicated account manager",
        "3% transaction fee",
        "Custom reporting",
        "Multi-user team access"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Event Director, TechConf",
      content: "TicketAI CRM increased our ticket sales by 40% and our streaming revenue by 300%. The AI insights are game-changing.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Venue Manager, The Grand Theater",
      content: "Managing multiple events used to be chaos. Now we have everything in one place with incredible analytics.",
      avatar: "MR"
    },
    {
      name: "Emily Johnson",
      role: "Music Promoter",
      content: "The audience insights help me book the right artists and price tickets perfectly. Revenue is up 60% this year.",
      avatar: "EJ"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/')}
                >
                  Product
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/live-streaming')}
                >
                  Features
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
                </button>
                <button 
                  className="text-blue-400 font-semibold"
                  onClick={() => navigate('/promoters-venues')}
                >
                  Promoters & Venues
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/promoter-login')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/promoter-crm')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Badge className="bg-blue-600 text-white">New</Badge>
                <span className="text-slate-400">Promoter CRM Dashboard</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Empower your events with{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI CRM
                </span>
              </h1>
              
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Manage sales, streaming, audience data and marketing from a single smart dashboard. 
                Built for promoters, venues and creators who want to grow revenue and engage audiences more effectively.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  onClick={() => navigate('/promoter-crm')}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
                >
                  Book a Demo
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="text-slate-400 hover:text-white text-lg"
                >
                  Join as Partner Venue
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="bg-slate-900/50 border-slate-700 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <IconComponent className={`w-5 h-5 ${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                          <p className="text-slate-400 text-xs mt-1">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Promoter Dashboard</span>
                </div>
                <Badge className="bg-green-600 text-white">Live</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Total Revenue (MTD)</div>
                  <div className="text-2xl font-bold text-white">$18,240</div>
                  <div className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Active Events</div>
                  <div className="text-2xl font-bold text-white">6</div>
                  <div className="text-blue-400 text-sm flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    This month
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-slate-400 font-semibold">Top Events</div>
                {[
                  { name: 'TechFest 2025', tickets: 950, revenue: '$11,400', status: 'Live' },
                  { name: 'Music Night LA', tickets: 400, revenue: '$6,000', status: 'Scheduled' }
                ].map((event, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-800/30 rounded-lg p-3">
                    <div>
                      <div className="font-semibold text-white text-sm">{event.name}</div>
                      <div className="text-slate-400 text-xs">{event.tickets} tickets sold</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white text-sm">{event.revenue}</div>
                      <Badge className={`text-xs ${event.status === 'Live' ? 'bg-green-600' : 'bg-blue-600'}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">Get Started</div>
                <p className="text-xs text-slate-500 mt-1">Access the full promoter dashboard with advanced analytics and AI insights.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Request Demo
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:bg-slate-800 text-xs">
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Why Choose TicketAI for Your Events?
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Transform your event business with AI-powered insights, streamlined operations, 
              and multiple revenue streams in one powerful platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-xl">{benefit.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Features for Promoters & Venues
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to manage, promote, and monetize your events
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <div className="p-3 bg-blue-600/20 rounded-lg w-fit">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Event & Ticket Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Create ticket types, set capacity, and manage sales channels with ease.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Multi-tier ticket pricing</li>
                  <li>• Real-time sales tracking</li>
                  <li>• Automated inventory management</li>
                  <li>• Custom checkout flows</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardHeader>
                <div className="p-3 bg-purple-600/20 rounded-lg w-fit">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">AI Audience Insights</CardTitle>
                <CardDescription className="text-slate-400">
                  Understand buyer behavior and maximize conversions with AI analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Predictive analytics</li>
                  <li>• Customer segmentation</li>
                  <li>• Behavioral insights</li>
                  <li>• ROI optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
              <CardHeader>
                <div className="p-3 bg-red-600/20 rounded-lg w-fit">
                  <Video className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Live Streaming & Replay</CardTitle>
                <CardDescription className="text-slate-400">
                  Host hybrid events with PPV, subscriptions, and replays.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Multi-camera streaming</li>
                  <li>• Global audience reach</li>
                  <li>• Monetized replays</li>
                  <li>• Interactive features</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-slate-400">
              Flexible pricing for promoters and venues of all sizes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`bg-slate-900/50 border-slate-700 relative ${
                tier.popular ? 'ring-2 ring-blue-500' : ''
              }`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl">{tier.name}</CardTitle>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.price !== 'Free' && tier.price !== 'Custom' && (
                      <span className="text-slate-400">/month</span>
                    )}
                  </div>
                  <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    onClick={() => navigate(tier.cta === 'Contact Sales' ? '/contact' : '/promoter-crm')}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Trusted by Event Professionals
            </h2>
            <p className="text-xl text-slate-400">
              See how promoters and venues are growing with TicketAI
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-300 mb-6">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                Ready to grow your events?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Get the promoter dashboard and start monetizing beyond the box office. 
                Join thousands of event professionals already using TicketAI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  onClick={() => navigate('/promoter-crm')}
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
                >
                  Book a Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Revolutionizing event ticketing through AI-driven recommendations and secure streaming.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Promoters</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/promoter-crm" className="hover:text-white transition-colors">Promoter CRM</a></li>
                <li><a href="/partner" className="hover:text-white transition-colors">Partner with Us</a></li>
                <li><a href="/live-streaming" className="hover:text-white transition-colors">Stream with TicketAI</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">AI Search</a></li>
                <li><a href="/live-streaming" className="hover:text-white transition-colors">Live Streaming</a></li>
                <li><a href="/merchandise" className="hover:text-white transition-colors">Merchandise</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-slate-400 text-sm">hello@ticketai.com</p>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2024 TicketAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PromotersVenues;