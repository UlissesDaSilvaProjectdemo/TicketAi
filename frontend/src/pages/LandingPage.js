import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Ticket, TrendingUp, Zap, Shield, Users, ArrowRight, DollarSign, Star, 
  CheckCircle, Play, BarChart3, Globe, Award, Mail, Phone, MapPin,
  Twitter, Linkedin, Instagram, ExternalLink
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleNewsletterSignup = () => {
    if (email) {
      // Mock newsletter signup
      alert('Thank you for subscribing to TicketAI updates!');
      setEmail('');
    }
  };

  const features = [
    {
      icon: <TrendingUp className="h-12 w-12 text-blue-500" />,
      title: "AI-Powered Predictions",
      description: "Our machine learning algorithms analyze market trends, artist popularity, and demand patterns to predict ticket price movements with 94% accuracy."
    },
    {
      icon: <Zap className="h-12 w-12 text-amber-500" />,
      title: "Real-Time Trading",
      description: "Buy and sell tickets instantly with dynamic pricing. Watch your investments grow as demand increases for popular events."
    },
    {
      icon: <Shield className="h-12 w-12 text-green-500" />,
      title: "Blockchain Security",
      description: "Every ticket is verified on the blockchain, ensuring authenticity and preventing fraud. Your investments are protected."
    },
    {
      icon: <Users className="h-12 w-12 text-purple-500" />,
      title: "Community Insights",
      description: "Join thousands of traders sharing market insights, predictions, and investment strategies in our community."
    }
  ];

  const pricingPlans = [
    {
      name: "Free Tier",
      price: "$0",
      period: "forever",
      description: "Perfect for casual event-goers",
      features: [
        "Browse all events",
        "Basic price alerts",
        "Community access",
        "5 transactions/month",
        "Standard support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro Trader",
      price: "$29",
      period: "per month",
      description: "For serious ticket investors",
      features: [
        "Unlimited transactions",
        "Advanced AI predictions",
        "Priority support",
        "Portfolio analytics",
        "Early event access",
        "Custom alerts"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "per month",
      description: "For event promoters & venues",
      features: [
        "White-label solution",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced reporting",
        "Bulk operations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Professional Trader",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      content: "I've made over $15,000 profit in 6 months using TicketAI's predictions. The AI insights are incredibly accurate.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Event Promoter", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      content: "TicketAI transformed how we price and sell tickets. Our revenue increased by 40% in the first quarter.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Music Fan",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      content: "I finally got Taylor Swift tickets at face value thanks to TicketAI's marketplace. Amazing platform!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Enhanced Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TicketAI
                  </span>
                  <div className="text-xs text-slate-400">Web Summit 2024 Winner</div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <button className="text-slate-300 hover:text-white transition-colors">Features</button>
                <button className="text-slate-300 hover:text-white transition-colors">Pricing</button>
                <button className="text-slate-300 hover:text-white transition-colors">Community</button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/events')}
                >
                  Explore Events
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white hidden md:inline-flex"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Enhanced Storytelling */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center space-y-8">
            {/* Recognition Badge */}
            <Badge className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400 mb-6">
              <Award className="w-4 h-4 mr-2" />
              Web Summit 2024 Startup Winner
            </Badge>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight">
                Discover Amazing
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Events
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed">
                Find and book tickets for the most exciting events from local venues and TicketMaster. Powered by AI to match you with perfect experiences.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 text-lg text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Smart AI Search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>50K+ Events Listed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Instant Booking</span>
                </div>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => navigate('/events')}
                >
                  Get AI Recommendations
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 text-xl px-12 py-8 rounded-2xl backdrop-blur-sm"
                  onClick={() => navigate('/events')}
                >
                  <Globe className="mr-3 h-6 w-6" />
                  Browse All Events
                </Button>
              </div>
              
              <p className="text-slate-500 text-sm">
                Free to use • Instant search • Thousands of events
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Smart Search */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI-Powered Smart Search
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Ask naturally - "rock concerts this weekend", "tech events under $100", or anything you have in mind
          </p>
        </div>
        
        {/* Search Demo */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ask me anything... 'Rock concerts this weekend' or 'Free tech events near me'"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 text-lg px-6 py-6 pr-32 rounded-2xl backdrop-blur-sm"
            />
            <Button 
              className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-4"
            >
              Search with AI
            </Button>
          </div>
        </div>

        {/* Smart Search Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Try These Smart Searches:</h3>
            <div className="space-y-3">
              {[
                "Find rock concerts this weekend in New York",
                "Tech conferences next month under $200", 
                "Free outdoor events near me",
                "Art galleries opening this week"
              ].map((query, index) => (
                <div key={index} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <p className="text-slate-300 text-sm">"{query}"</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Popular Searches:</h3>
            <div className="space-y-3">
              {[
                "Sports games for families with kids",
                "Comedy shows tonight downtown",
                "Music festivals in California this summer",
                "Business networking events next week"
              ].map((query, index) => (
                <div key={index} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <p className="text-slate-300 text-sm">"{query}"</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Trending Now:</h3>
            <div className="space-y-3">
              {[
                { name: "Tech Conference 2025", price: "$299", status: "🔥 Hot" },
                { name: "Amazing Music Festival", price: "$89", status: "🎵 Music" },
                { name: "Comedy Night Downtown", price: "$35", status: "😂 Comedy" },
                { name: "Art Gallery Opening", price: "Free", status: "🎨 Art" }
              ].map((event, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs mb-1">
                          {event.status}
                        </Badge>
                        <h4 className="font-semibold text-white text-sm">{event.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{event.price}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            onClick={() => navigate('/events')}
          >
            Discover Events
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose TicketAI?
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Advanced technology meets live entertainment to create unprecedented opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-900/30 border-slate-800 hover:bg-slate-900/50 transition-all duration-300 text-center p-8">
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-slate-400">
            See what our community is saying about TicketAI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700 p-8">
              <CardContent className="space-y-6">
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
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

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-400">
            Start free and scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-blue-500 bg-slate-900/70' : 'bg-slate-900/50 border-slate-700'} transition-all duration-300 hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center p-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-5xl font-bold text-white">
                    {plan.price}
                    <span className="text-lg font-normal text-slate-400">/{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-6 text-lg ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  onClick={() => navigate('/auth')}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700 p-12">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">Stay Ahead of the Market</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get exclusive market insights, AI predictions, and early access to new features.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-lg px-6 py-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                onClick={handleNewsletterSignup}
              >
                Subscribe
              </Button>
            </div>
            
            <p className="text-slate-500 text-sm">
              Join 15,000+ traders getting weekly insights • Unsubscribe anytime
            </p>
          </div>
        </Card>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Revolutionizing event ticketing through AI-powered predictions and blockchain security.
              </p>
              <div className="flex space-x-4">
                <Twitter className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Linkedin className="w-6 h-6 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Instagram className="w-6 h-6 text-slate-400 hover:text-pink-400 cursor-pointer transition-colors" />
              </div>
            </div>
            
            {/* Product Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
            
            {/* Contact & Support */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Support</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>hello@ticketai.com</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
              
              {/* Indiegogo CTA */}
              <Button 
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white"
                onClick={() => window.open('https://indiegogo.com', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Support Our Campaign
              </Button>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              © 2025 TicketAI Inc. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;