import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { 
  Ticket, TrendingUp, Zap, Shield, Users, ArrowRight, DollarSign, Star, 
  CheckCircle, Play, BarChart3, Globe, Award, Mail, Phone, MapPin,
  Twitter, Linkedin, Instagram, ExternalLink, Search, Calendar
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleNewsletterSignup = () => {
    if (email) {
      // Mock newsletter signup
      alert('Thank you for subscribing to TicketAI updates!');
      setEmail('');
    }
  };

  const mockSearchResults = {
    'rock concerts': [
      { id: 1, name: 'Arctic Monkeys Live', venue: 'Madison Square Garden', date: 'Dec 15, 2024', price: '$89', category: 'Music', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop' },
      { id: 2, name: 'Foo Fighters World Tour', venue: 'Barclays Center', date: 'Dec 22, 2024', price: '$125', category: 'Music', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&h=200&fit=crop' },
      { id: 3, name: 'Local Rock Festival', venue: 'Central Park', date: 'Dec 28, 2024', price: '$45', category: 'Festival', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=200&fit=crop' }
    ],
    'tech events': [
      { id: 4, name: 'AI & Machine Learning Summit', venue: 'Javits Center', date: 'Jan 10, 2025', price: '$299', category: 'Conference', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop' },
      { id: 5, name: 'Startup Networking Night', venue: 'WeWork SoHo', date: 'Dec 18, 2024', price: 'Free', category: 'Networking', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop' },
      { id: 6, name: 'Blockchain Conference 2025', venue: 'Brooklyn Expo Center', date: 'Jan 15, 2025', price: '$199', category: 'Conference', image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=200&fit=crop' }
    ],
    'comedy': [
      { id: 7, name: 'Stand-Up Comedy Night', venue: 'Comedy Cellar', date: 'Dec 16, 2024', price: '$35', category: 'Comedy', image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&h=200&fit=crop' },
      { id: 8, name: 'Improv Comedy Show', venue: 'UCB Theatre', date: 'Dec 20, 2024', price: '$25', category: 'Comedy', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop' }
    ],
    'art': [
      { id: 9, name: 'Modern Art Gallery Opening', venue: 'MoMA', date: 'Dec 19, 2024', price: 'Free', category: 'Art', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop' },
      { id: 10, name: 'Street Art Exhibition', venue: 'Brooklyn Museum', date: 'Dec 25, 2024', price: '$20', category: 'Art', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' }
    ],
    'sports': [
      { id: 11, name: 'Knicks vs Lakers', venue: 'Madison Square Garden', date: 'Dec 21, 2024', price: '$150', category: 'Sports', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop' },
      { id: 12, name: 'Rangers Hockey Game', venue: 'Madison Square Garden', date: 'Dec 23, 2024', price: '$85', category: 'Sports', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' }
    ]
  };

  const handleAISearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setShowResults(false);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      let results = [];
      
      // Simple keyword matching for demo
      if (query.includes('rock') || query.includes('music') || query.includes('concert')) {
        results = mockSearchResults['rock concerts'];
      } else if (query.includes('tech') || query.includes('conference') || query.includes('startup')) {
        results = mockSearchResults['tech events'];
      } else if (query.includes('comedy') || query.includes('funny') || query.includes('laugh')) {
        results = mockSearchResults['comedy'];
      } else if (query.includes('art') || query.includes('gallery') || query.includes('exhibition')) {
        results = mockSearchResults['art'];
      } else if (query.includes('sport') || query.includes('game') || query.includes('basketball') || query.includes('hockey')) {
        results = mockSearchResults['sports'];
      } else {
        // Default mixed results for any other query
        results = [
          ...mockSearchResults['rock concerts'].slice(0, 2),
          ...mockSearchResults['tech events'].slice(0, 2),
          ...mockSearchResults['comedy'].slice(0, 1)
        ];
      }
      
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 1500);
  };

  const features = [
    {
      icon: <Zap className="h-12 w-12 text-blue-500" />,
      title: "Smart AI Search",
      description: "Ask in natural language and our AI understands exactly what you're looking for. Find events by mood, budget, location, or any criteria you can think of."
    },
    {
      icon: <Globe className="h-12 w-12 text-amber-500" />,
      title: "TicketMaster Integration",
      description: "Access official tickets from TicketMaster plus local venues in one place. Compare prices and find the best deals instantly."
    },
    {
      icon: <Shield className="h-12 w-12 text-green-500" />,
      title: "Verified Events",
      description: "Every event is verified and authenticated. Book with confidence knowing you're getting legitimate tickets from trusted sources."
    },
    {
      icon: <Users className="h-12 w-12 text-purple-500" />,
      title: "Personalized Recommendations",
      description: "Our AI learns your preferences and suggests events you'll love. Discover hidden gems and never miss out on perfect matches."
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
      role: "Music Lover",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      content: "TicketAI found me the perfect indie concert I never would have discovered. The AI search is incredibly intuitive!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Event Organizer", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      content: "Our event attendance increased by 60% after listing on TicketAI. Their smart recommendations really work.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Tech Professional",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      content: "I just searched 'networking events this week' and found 3 perfect matches. Saved me hours of research!",
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
            />
            <Button 
              className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-4 disabled:opacity-50"
              onClick={handleAISearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? 'Searching...' : 'Search with AI'}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {showResults && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                AI Search Results for "{searchQuery}"
              </h3>
              <p className="text-slate-400">
                Found {searchResults.length} perfect matches for you
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((event) => (
                <Card key={event.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer group">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-blue-600/90 text-white border-0">
                      {event.category}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {event.name}
                      </h4>
                      <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3">
                        <div className="text-2xl font-bold text-white">
                          {event.price}
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => navigate('/events')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => navigate('/events')}
              >
                View All Results
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

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
                <div 
                  key={index} 
                  className="p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery(query);
                    setTimeout(() => handleAISearch(), 100);
                  }}
                >
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
                <div 
                  key={index} 
                  className="p-3 bg-slate-800/30 rounded-lg border border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery(query);
                    handleAISearch();
                  }}
                >
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

      {/* AI Recommendations Form */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Your AI Recommendations
            </h2>
            <p className="text-xl text-slate-400">
              Share your interests and let our AI find events you'll love
            </p>
          </div>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <form className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="interests" className="text-lg font-semibold text-white">
                    What kind of events do you enjoy? *
                  </Label>
                  <Textarea
                    id="interests"
                    placeholder="Tell us about your interests, hobbies, or the type of events you like to attend..."
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px] text-lg leading-relaxed"
                  />
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-300 mb-3">Try:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "I love music festivals and outdoor concerts",
                        "Tech conferences and startup networking events", 
                        "Art galleries and cultural exhibitions",
                        "Comedy shows and entertainment events",
                        "Sports events and live games"
                      ].map((example, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 cursor-pointer transition-colors text-sm text-slate-300"
                          onClick={() => {
                            const textarea = document.getElementById('interests');
                            if (textarea) {
                              textarea.value = example;
                              textarea.focus();
                            }
                          }}
                        >
                          <span className="italic">"{example}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="location" className="text-lg font-semibold text-white">
                    Preferred Location (Optional)
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., New York, San Francisco, or leave blank for all locations"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-lg py-6"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="submit"
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/events');
                    }}
                  >
                    <Star className="mr-2 h-5 w-5" />
                    Get My Recommendations
                  </Button>
                  
                  <Button 
                    type="button"
                    size="lg" 
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6 flex-1"
                    onClick={() => navigate('/events')}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Browse All Events
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-slate-500">
                    Our AI analyzes your preferences to find the perfect events. No spam, just great recommendations.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose TicketAI?
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            The smartest way to discover, compare, and book tickets for amazing events
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
            Loved by Event-Goers
          </h2>
          <p className="text-xl text-slate-400">
            See how TicketAI is helping people discover amazing experiences
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

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-slate-400">
            Finding your perfect event is as easy as asking a question
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-900/50 border-slate-700 text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-600/20 rounded-2xl">
                  <Search className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">1. Ask Naturally</h3>
                <p className="text-slate-300">
                  Just type what you're looking for in plain English. "Rock concerts this weekend" or "free tech events near me" - our AI understands it all.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-purple-600/20 rounded-2xl">
                  <Zap className="h-12 w-12 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">2. Get Smart Results</h3>
                <p className="text-slate-300">
                  Our AI instantly searches through thousands of events from TicketMaster and local venues, matching your exact preferences and budget.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 text-center p-8">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-600/20 rounded-2xl">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Book Instantly</h3>
                <p className="text-slate-300">
                  Compare prices, read reviews, and book your tickets directly. Safe, secure, and hassle-free - just the way it should be.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700 p-12">
          <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">Never Miss Great Events</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get personalized event recommendations, exclusive presales, and early access to hot tickets.
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
              Join 25,000+ event lovers getting personalized recommendations • Unsubscribe anytime
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