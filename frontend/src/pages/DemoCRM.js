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
  Flame, Star, Eye, ThumbsUp, UserPlus, Hash
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

  const categories = [
    { icon: Music, label: 'Music', color: 'from-pink-500 to-rose-500' },
    { icon: Coffee, label: 'Food', color: 'from-amber-500 to-orange-500' },
    { icon: Palette, label: 'Art', color: 'from-purple-500 to-indigo-500' },
    { icon: Gamepad2, label: 'Gaming', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Network', color: 'from-blue-500 to-cyan-500' },
    { icon: Calendar, label: 'Business', color: 'from-slate-500 to-gray-500' }
  ];

  const trendingHashtags = [
    { tag: '#musicfest', posts: '12.5K' },
    { tag: '#ticketai', posts: '8.9K' },
    { tag: '#liveevents', posts: '15.2K' },
    { tag: '#eventpromo', posts: '6.7K' },
    { tag: '#community', posts: '25.1K' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI Community
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search posts, events, hashtags..."
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/promoter-crm')}
                className="border-green-500 text-green-400 hover:bg-green-600 hover:text-white"
              >
                Access CRM
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            {currentUser && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-6 text-center">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-blue-500"
                  />
                  <h3 className="text-white font-bold text-lg">{currentUser.name}</h3>
                  <p className="text-blue-400 text-sm mb-3">@{currentUser.username}</p>
                  <p className="text-slate-400 text-sm mb-4">{currentUser.bio}</p>
                  
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-white font-bold">{currentUser.posts}</div>
                      <div className="text-slate-400 text-xs">Posts</div>
                    </div>
                    <div>
                      <div className="text-white font-bold">{currentUser.followers}</div>
                      <div className="text-slate-400 text-xs">Followers</div>
                    </div>
                    <div>
                      <div className="text-white font-bold">{currentUser.following}</div>
                      <div className="text-slate-400 text-xs">Following</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Explore Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-300">{category.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Modal */}
            {showCreatePost && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Create New Post</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCreatePost(false)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's happening at your event?"
                    className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="📍 Location"
                      className="bg-slate-900 border-slate-600 text-white"
                      value={newPost.location}
                      onChange={(e) => setNewPost({...newPost, location: e.target.value})}
                    />
                    <Input
                      placeholder="#hashtags #events"
                      className="bg-slate-900 border-slate-600 text-white"
                      value={newPost.hashtags}
                      onChange={(e) => setNewPost({...newPost, hashtags: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleCreatePost}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!newPost.content.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            {posts.map((post) => (
              <Card key={post.id} className="bg-slate-800/50 border-slate-600 hover:border-slate-500 transition-colors">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={post.user.avatar} 
                          alt={post.user.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-600"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold">{post.user.name}</span>
                            {post.user.verified && (
                              <Badge className="bg-blue-600 text-xs">✓</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400 text-sm">
                            <span>@{post.user.username}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-5 h-5 text-slate-400" />
                      </Button>
                    </div>
                    
                    <p className="text-slate-300 leading-relaxed mb-4">{post.content}</p>
                    
                    {post.location && (
                      <div className="flex items-center space-x-2 text-slate-400 text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{post.location}</span>
                      </div>
                    )}
                    
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.hashtags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-blue-400 border-blue-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Post Image */}
                  {post.image && (
                    <div className="relative">
                      <img 
                        src={post.image} 
                        alt="Post content"
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="p-6 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${post.liked ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
                        >
                          <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-400 hover:text-blue-500">
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-400 hover:text-green-500">
                          <Share2 className="w-5 h-5" />
                          <span>{post.shares}</span>
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleBookmark(post.id)}
                        className={`${post.bookmarked ? 'text-yellow-500' : 'text-slate-400'} hover:text-yellow-500`}
                      >
                        <Bookmark className={`w-5 h-5 ${post.bookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Hashtags */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingHashtags.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors">
                    <div>
                      <div className="text-blue-400 font-semibold">{item.tag}</div>
                      <div className="text-slate-400 text-sm">{item.posts} posts</div>
                    </div>
                    <Fire className="w-4 h-4 text-orange-500" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Members</span>
                  <span className="text-white font-bold">12.5K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Posts Today</span>
                  <span className="text-white font-bold">1.2K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Events Shared</span>
                  <span className="text-white font-bold">890</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Success Stories</span>
                  <span className="text-white font-bold">456</span>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
              <CardContent className="p-6 text-center">
                <Ticket className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Ready to Grow?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Join our CRM and start maximizing your event success!
                </p>
                <Button 
                  onClick={() => setShowContactPopup(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Popup - Non-blocking */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onSubmit={handleContactSubmit}
        trigger="community_page"
      />
    </div>
  );
};

export default DemoCRM;