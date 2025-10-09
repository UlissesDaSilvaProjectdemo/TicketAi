import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Play, Users, Zap, DollarSign, BarChart3, Shield, 
  Video, Mic, Calendar, Clock, Eye, MessageCircle,
  Star, TrendingUp, Wifi, Globe, Camera, Ticket,
  CreditCard, LogOut, User
} from 'lucide-react';

const LiveStreaming = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [liveStreams, setLiveStreams] = useState([]);
  const [upcomingStreams, setUpcomingStreams] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData') || localStorage.getItem('promoterUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load live and upcoming streams
    loadStreams();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('promoterUser');
    navigate('/');
  };

  // Mock streaming data
  const loadStreams = () => {
    const mockLiveStreams = [
      {
        id: 'stream-1',
        title: 'Arctic Monkeys - Live from Studio',
        artist: 'Arctic Monkeys',
        viewers: 12847,
        price: 19.99,
        type: 'pay_per_view',
        status: 'live',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop',
        duration: '2h 15m',
        quality: 'HD',
        features: ['Multi-camera', 'Live Chat', 'Backstage Access']
      },
      {
        id: 'stream-2',
        title: 'Jazz Night at Blue Note',
        artist: 'Various Artists',
        viewers: 3421,
        price: 12.99,
        type: 'pay_per_view',
        status: 'live',
        thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=250&fit=crop',
        duration: '1h 45m',
        quality: 'HD',
        features: ['Interactive Q&A', 'Live Chat']
      }
    ];

    const mockUpcomingStreams = [
      {
        id: 'stream-3',
        title: 'Foo Fighters - World Tour Finale',
        artist: 'Foo Fighters',
        startTime: '2024-12-20T20:00:00Z',
        price: 24.99,
        type: 'vip_access',
        expectedViewers: 50000,
        thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=250&fit=crop',
        duration: '3h',
        quality: '4K',
        features: ['4K Stream', 'Backstage Pass', 'Meet & Greet', 'Exclusive Merch']
      },
      {
        id: 'stream-4',
        title: 'Electronic Music Festival 2024',
        artist: 'Multiple DJs',
        startTime: '2024-12-22T18:00:00Z',
        price: 15.99,
        type: 'festival_pass',
        expectedViewers: 25000,
        thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop',
        duration: '8h',
        quality: 'HD',
        features: ['Multiple Stages', '8-Hour Stream', 'DJ Sets']
      }
    ];

    setLiveStreams(mockLiveStreams);
    setUpcomingStreams(mockUpcomingStreams);
  };

  const handleStreamAccess = async (stream) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Here we would integrate with the streaming access system
    // For now, show a demo message
    alert(`🎬 Accessing "${stream.title}" stream! In production, this would check ticket ownership and generate playback tokens.`);
  };

  const handlePurchaseAccess = async (stream) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Here we would integrate with Stripe for stream access purchase
    alert(`💳 Purchasing access to "${stream.title}" for $${stream.price}! Integrating with Stripe payment system...`);
  };

  const formatViewers = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

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
                  AI-Powered Events
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/events')}
                >
                  Events
                </button>
                <button 
                  className="text-blue-400 font-semibold"
                  onClick={() => navigate('/live-streaming')}
                >
                  Live Streaming
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/my-tickets')}
                >
                  My Tickets
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/merchandise')}
                >
                  Merchandise
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3 bg-slate-800/50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name ? user.name.charAt(0) : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="text-white font-semibold">
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className="text-slate-400">{user.email}</div>
                  </div>
                  {user.credits && (
                    <div className="flex items-center space-x-1 text-green-400">
                      <CreditCard className="w-4 h-4" />
                      <span className="font-semibold">{user.credits} credits</span>
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl">
              <Video className="h-8 w-8 text-white" />
            </div>
            <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Live Streams — Watch, Engage, Invest
          </h1>
          <p className="text-xl text-slate-400 max-w-4xl mx-auto mb-8">
            High-quality, low-latency streaming for fans, powerful tools for organizers, 
            and monetization & investment features that turn events into opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-lg px-8 py-6"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Browse Live Streams
            </Button>
            <Button 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
              size="lg"
              onClick={() => navigate('/promoter-login')}
            >
              <Video className="w-5 h-5 mr-2" />
              Create Live Event
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">For Fans</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-300">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Real-time access to live and backstage content</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Interactive chat, polls, and tipping</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-sm">AI-powered personalized recommendations</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">For Organizers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-300">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm">Sell PPV, subscriptions & VIP streams</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm">Real-time analytics and revenue tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Camera className="w-4 h-4 text-green-400" />
                <span className="text-sm">Multi-camera and production controls</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">For Investors</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-300">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Recurring revenue & high LTV potential</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Actionable viewer metrics and insights</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Roadmap to tokenized ownership</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Now Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold text-white">Live Now</h2>
              <Badge className="bg-red-600 text-white">
                {liveStreams.length} streams
              </Badge>
            </div>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              View All Live
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {liveStreams.map((stream) => (
              <Card key={stream.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all overflow-hidden">
                <div className="relative">
                  <img 
                    src={stream.thumbnail} 
                    alt={stream.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-600 text-white animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/50 text-white">
                      {stream.quality}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-black/50 rounded px-2 py-1">
                        <Users className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{formatViewers(stream.viewers)}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/50 rounded px-2 py-1">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{stream.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{stream.title}</h3>
                      <p className="text-slate-400">{stream.artist}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {stream.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        ${stream.price}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleStreamAccess(stream)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          onClick={() => handlePurchaseAccess(stream)}
                        >
                          <CreditCard className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Upcoming Streams Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Upcoming Streams</h2>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              View All Upcoming
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingStreams.map((stream) => (
              <Card key={stream.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all overflow-hidden">
                <div className="relative">
                  <img 
                    src={stream.thumbnail} 
                    alt={stream.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/50 text-white">
                      {stream.quality}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-black/50 rounded px-2 py-1">
                        <Calendar className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">
                          {new Date(stream.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-black/50 rounded px-2 py-1">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{stream.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{stream.title}</h3>
                      <p className="text-slate-400">{stream.artist}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {stream.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Starts:</span>
                        <span className="text-white font-semibold">
                          {new Date(stream.startTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-slate-400">Expected viewers:</span>
                        <span className="text-green-400 font-semibold">
                          {formatViewers(stream.expectedViewers)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        ${stream.price}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handlePurchaseAccess(stream)}
                        >
                          <Ticket className="w-4 h-4 mr-2" />
                          Get Access
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700 mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-4">How It Works</CardTitle>
            <CardDescription className="text-slate-400 max-w-3xl mx-auto">
              Organizers configure event access, stream ingest is transcoded and distributed via CDN, 
              viewers purchase access or use subscriptions, interact live, and enjoy on-demand replays.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-full">
                    <Wifi className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">Ingest</h4>
                <p className="text-sm text-slate-400">RTMP / Cloud sources</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-600/20 rounded-full">
                    <Globe className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">Delivery</h4>
                <p className="text-sm text-slate-400">Adaptive bitrate, global CDN</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">Monetize</h4>
                <p className="text-sm text-slate-400">PPV, subscriptions, tipping</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-red-600/20 rounded-full">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-2">Secure</h4>
                <p className="text-sm text-slate-400">DRM, access control</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border-red-500/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Stream?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join thousands of artists and organizers already streaming live events and building engaged communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Start Watching
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <Video className="w-4 h-4 mr-2" />
                Create Your Stream
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveStreaming;