import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import ContactPopup from '../components/ContactPopup';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Plus,
  Search, Bell, Home, Compass, User, Send, Camera, Video,
  MapPin, Tag, Smile, ArrowLeft, Filter, TrendingUp, Users,
  Calendar, Ticket, Music, Coffee, Gamepad2, Palette, Globe,
  Fire, Star, Eye, ThumbsUp, UserPlus, Hash
} from 'lucide-react';

const DemoCRM = () => {
  const navigate = useNavigate();
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', image: '', location: '', hashtags: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');

  // Initialize user and load community data
  useEffect(() => {
    // Create/get community user
    let user = localStorage.getItem('communityUser');
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        username: 'eventlover_' + Math.floor(Math.random() * 1000),
        name: 'Event Enthusiast',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        followers: 1250,
        following: 890,
        posts: 45,
        bio: '🎵 Music lover | 🎪 Event organizer | 📍 LA'
      };
      localStorage.setItem('communityUser', JSON.stringify(user));
    } else {
      user = JSON.parse(user);
    }
    setCurrentUser(user);

    // Load demo posts
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = () => {
    const demoPosts = [
      {
        id: 'post_1',
        user: {
          username: 'musicfest2024',
          name: 'LA Music Festival',
          avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop',
          verified: true
        },
        content: "🎵 Just wrapped up an AMAZING weekend at our music festival! Over 50,000 attendees and the energy was absolutely electric! Thanks to @ticketai for helping us manage everything seamlessly 🚀",
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
        location: 'Los Angeles, CA',
        likes: 1543,
        comments: 89,
        shares: 156,
        hashtags: ['#musicfest', '#LA', '#ticketai', '#livemusic'],
        timestamp: '2 hours ago',
        liked: false,
        bookmarked: false
      },
      {
        id: 'post_2',
        user: {
          username: 'techconf_pro',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b373?w=150&h=150&fit=crop&crop=face',
          verified: false
        },
        content: "Pro tip for event organizers: The analytics dashboard in TicketAI is a game changer! 📊 We increased our ticket sales by 40% just by understanding our audience better. Who else is using data-driven strategies? 🤔",
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        location: 'San Francisco, CA',
        likes: 892,
        comments: 67,
        shares: 94,
        hashtags: ['#eventmarketing', '#analytics', '#ticketsales', '#growth'],
        timestamp: '6 hours ago',
        liked: true,
        bookmarked: true
      },
      {
        id: 'post_3',
        user: {
          username: 'comedynight_sf',
          name: 'Comedy Central SF',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          verified: true
        },
        content: "Last night's comedy show was SOLD OUT! 🎭 The crowd was incredible and the laughs were non-stop. Already planning our next event - drop a 🤣 if you want early access tickets!",
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop',
        location: 'San Francisco Comedy Club',
        likes: 456,
        comments: 34,
        shares: 28,
        hashtags: ['#comedy', '#standup', '#SF', '#soldout'],
        timestamp: '1 day ago',
        liked: false,
        bookmarked: false
      },
      {
        id: 'post_4',
        user: {
          username: 'artgallery_nyc',
          name: 'Modern Art Collective',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          verified: false
        },
        content: "Opening night was absolutely magical! ✨ Over 300 art lovers joined us to celebrate emerging artists. The community response has been overwhelming. Next exhibition drops next month! 🎨",
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        location: 'Chelsea, NYC',
        likes: 678,
        comments: 45,
        shares: 62,
        hashtags: ['#artexhibition', '#NYC', '#modernart', '#community'],
        timestamp: '2 days ago',
        liked: true,
        bookmarked: false
      },
      {
        id: 'post_5',
        user: {
          username: 'startup_events',
          name: 'Startup Networking Hub',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
          verified: true
        },
        content: "🚀 Incredible networking session last night! Investors, founders, and dreamers all in one room. Three new partnerships were formed right on the spot! The power of bringing the right people together 💼",
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
        location: 'Silicon Valley',
        likes: 1204,
        comments: 156,
        shares: 203,
        hashtags: ['#startup', '#networking', '#siliconvalley', '#innovation'],
        timestamp: '3 days ago',
        liked: false,
        bookmarked: true
      }
    ];
    setPosts(demoPosts);
  };

  const handleContactSubmit = (formData) => {
    console.log('Community lead captured:', formData);
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;
    
    const post = {
      id: `post_${Date.now()}`,
      user: currentUser,
      content: newPost.content,
      image: newPost.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      location: newPost.location,
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 30),
      hashtags: newPost.hashtags.split(' ').filter(tag => tag.startsWith('#')),
      timestamp: 'Just now',
      liked: false,
      bookmarked: false
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost({ content: '', image: '', location: '', hashtags: '' });
    setShowCreatePost(false);
  };

  const features = [
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time revenue, ticket sales, and audience insights" },
    { icon: Users, title: "Audience Management", desc: "Contact segmentation and engagement tracking" },
    { icon: DollarSign, title: "Revenue Optimization", desc: "Multiple revenue streams and automated payouts" },
    { icon: Calendar, title: "Event Management", desc: "Complete event lifecycle management and performance tracking" },
    { icon: Target, title: "Marketing Campaigns", desc: "Email marketing, automation, and campaign analytics" },
    { icon: TrendingUp, title: "Growth Analytics", desc: "AI-powered insights and recommendation engine" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Elite Events",
      feedback: "TicketAI CRM increased our ticket sales by 65% in just 3 months. The audience insights are game-changing!",
      revenue: "+$120K"
    },
    {
      name: "Michael Chen",  
      company: "Music Collective",
      feedback: "The marketing automation saved us 20 hours per week. ROI was immediate.",
      revenue: "+$85K"
    },
    {
      name: "Emma Davis",
      company: "Corporate Events Plus",
      feedback: "Finally, a CRM built specifically for event promoters. The streaming integration is brilliant.",
      revenue: "+$200K"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg px-6 py-2">
              <Timer className="w-4 h-4 mr-2" />
              30-Day Free Trial • No Credit Card Required
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              TicketAI{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CRM Demo
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              The complete event promotion platform trusted by 2,500+ promoters. 
              Manage events, grow audiences, and maximize revenue with AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Button 
                size="lg"
                onClick={startFreeTrial}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-12 py-8 font-semibold"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Start Free 30-Day Trial
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setShowContactPopup(true)}
                className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white text-xl px-12 py-8"
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Demo Video
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Full Feature Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Everything You Need to Grow Events</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            From analytics to automation, manage your entire event business in one powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-600 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-slate-900/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Trusted by Top Event Promoters</h2>
            <p className="text-xl text-slate-400">
              Join thousands of promoters who've grown their revenue with TicketAI CRM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge className="ml-auto bg-green-600 text-white">
                      {testimonial.revenue}
                    </Badge>
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.feedback}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-3xl p-12 text-center">
          <Badge className="bg-green-600 text-white mb-6">
            <Sparkles className="w-4 h-4 mr-1" />
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Growing Your Events Today
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join 2,500+ successful promoters. Get full access to TicketAI CRM with our 30-day free trial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={startFreeTrial}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-12 py-8"
            >
              <Timer className="w-6 h-6 mr-3" />
              Claim Your Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/promoters-venues')}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xl px-12 py-8"
            >
              Learn More
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>

          <p className="text-slate-500 text-sm mt-6">
            30-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Contact Popup - Non-blocking */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onSubmit={handleContactSubmit}
        trigger="demo_crm_page"
      />

      {/* Pricing Modal - Shows after trial expiry */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-4xl w-full mx-auto animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Your Free Trial Has Ended
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Continue growing your events with a paid subscription
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <Card className="border-slate-600 relative">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Starter</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $29<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Up to 5 events/month</div>
                    <div className="text-slate-300 text-sm">✓ 1,000 contacts</div>
                    <div className="text-slate-300 text-sm">✓ Basic analytics</div>
                    <div className="text-slate-300 text-sm">✓ Email support</div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleUpgrade('starter')}
                    >
                      Select Starter
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="border-blue-500 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Pro</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $79<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Unlimited events</div>
                    <div className="text-slate-300 text-sm">✓ 10,000 contacts</div>
                    <div className="text-slate-300 text-sm">✓ Advanced analytics</div>
                    <div className="text-slate-300 text-sm">✓ Marketing automation</div>
                    <div className="text-slate-300 text-sm">✓ Priority support</div>
                    <Button 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpgrade('pro')}
                    >
                      Select Pro
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="border-slate-600 relative">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Enterprise</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $199<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Everything in Pro</div>
                    <div className="text-slate-300 text-sm">✓ Unlimited contacts</div>
                    <div className="text-slate-300 text-sm">✓ White-label options</div>
                    <div className="text-slate-300 text-sm">✓ API access</div>
                    <div className="text-slate-300 text-sm">✓ Dedicated support</div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleUpgrade('enterprise')}
                    >
                      Select Enterprise
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button 
                  variant="ghost"
                  onClick={() => setShowPricingModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Continue with Limited Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DemoCRM;