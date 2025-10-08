import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  ShoppingCart, Heart, Star, Search, Filter, Truck, 
  Shield, ExternalLink, User, Shirt, Music, Camera,
  Tag, DollarSign, MapPin, Clock, Ticket, CreditCard,
  LogOut, Plus, Eye, TrendingUp, Store, AlertCircle
} from 'lucide-react';

const Merchandise = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData') || localStorage.getItem('promoterUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('merchCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('promoterUser');
    navigate('/');
  };

  // Mock merchandise data with various artists and external platform integration
  const mockMerchandise = [
    {
      id: 'merch-1',
      name: 'Arctic Monkeys Tour T-Shirt',
      artist: 'Arctic Monkeys',
      price: 29.99,
      originalPrice: 39.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      category: 'clothing',
      platform: 'official',
      rating: 4.8,
      reviews: 324,
      inStock: true,
      description: 'Official tour merchandise from the AM World Tour',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy'],
      seller: 'Arctic Monkeys Official Store',
      tags: ['tour', 'official', 'limited edition']
    },
    {
      id: 'merch-2',
      name: 'Vinyl Record - AM Album',
      artist: 'Arctic Monkeys',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      category: 'music',
      platform: 'etsy',
      rating: 4.9,
      reviews: 156,
      inStock: true,
      description: 'Limited edition vinyl pressing of the AM album',
      seller: 'VinylCollector_NYC',
      tags: ['vinyl', 'collectible', 'album'],
      externalUrl: 'https://etsy.com/listing/example'
    },
    {
      id: 'merch-3',
      name: 'Concert Poster Print',
      artist: 'Various Artists',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      category: 'art',
      platform: 'redbubble',
      rating: 4.6,
      reviews: 89,
      inStock: true,
      description: 'High-quality print of iconic concert posters',
      sizes: ['12x18', '18x24', '24x36'],
      seller: 'ConcertArtStudio',
      tags: ['poster', 'art', 'print'],
      externalUrl: 'https://redbubble.com/example'
    },
    {
      id: 'merch-4',
      name: 'Band Logo Hoodie',
      artist: 'Foo Fighters',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1556821840-3a9c6c1b3845?w=400&h=400&fit=crop',
      category: 'clothing',
      platform: 'official',
      rating: 4.7,
      reviews: 241,
      inStock: true,
      description: 'Premium hoodie with embroidered band logo',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'Gray', 'Maroon'],
      seller: 'Foo Fighters Official',
      tags: ['hoodie', 'official', 'embroidered']
    },
    {
      id: 'merch-5',
      name: 'Festival Wristband Set',
      artist: 'Various Artists',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
      category: 'accessories',
      platform: 'etsy',
      rating: 4.4,
      reviews: 67,
      inStock: true,
      description: 'Authentic festival wristbands from major music events',
      seller: 'FestivalMemories',
      tags: ['festival', 'wristband', 'collectible'],
      externalUrl: 'https://etsy.com/listing/festival-wristbands'
    },
    {
      id: 'merch-6',
      name: 'Limited Edition Guitar Pick Set',
      artist: 'The Beatles',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      category: 'accessories',
      platform: 'reverb',
      rating: 4.9,
      reviews: 412,
      inStock: false,
      description: 'Collector set of guitar picks with band signatures',
      seller: 'MusicCollectibles_Pro',
      tags: ['guitar picks', 'limited edition', 'collectible'],
      externalUrl: 'https://reverb.com/example'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: Store, count: mockMerchandise.length },
    { id: 'clothing', name: 'Clothing', icon: Shirt, count: mockMerchandise.filter(item => item.category === 'clothing').length },
    { id: 'music', name: 'Music & Vinyl', icon: Music, count: mockMerchandise.filter(item => item.category === 'music').length },
    { id: 'art', name: 'Art & Posters', icon: Camera, count: mockMerchandise.filter(item => item.category === 'art').length },
    { id: 'accessories', name: 'Accessories', icon: Tag, count: mockMerchandise.filter(item => item.category === 'accessories').length }
  ];

  const platforms = {
    official: { name: 'Official Store', color: 'bg-green-600', icon: Shield, free: true },
    etsy: { name: 'Etsy', color: 'bg-orange-600', icon: Store, free: false },
    redbubble: { name: 'Redbubble', color: 'bg-red-600', icon: Shirt, free: false },
    reverb: { name: 'Reverb', color: 'bg-blue-600', icon: Music, free: false }
  };

  const filteredMerchandise = mockMerchandise.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item) => {
    const updatedCart = [...cart, { ...item, cartId: Date.now() }];
    setCart(updatedCart);
    localStorage.setItem('merchCart', JSON.stringify(updatedCart));
  };

  // Platforms that charge credits (1.5 credits per click)
  const chargablePlatforms = ['etsy', 'redbubble', 'reverb'];
  const PLATFORM_FEE = 1.5;

  const handleBuyExternal = (item) => {
    // Check if this platform requires a credit fee
    if (chargablePlatforms.includes(item.platform)) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase from external platforms.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      if (!user.credits || user.credits < PLATFORM_FEE) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${PLATFORM_FEE} credits to purchase from external platforms. Current balance: ${user.credits || 0}`,
          variant: "destructive"
        });
        return;
      }

      // Show confirmation modal
      setPendingPurchase(item);
      setShowFeeModal(true);
    } else {
      // Free platforms or official stores
      if (item.externalUrl) {
        window.open(item.externalUrl, '_blank');
      }
    }
  };

  const confirmPurchase = () => {
    if (!pendingPurchase || !user) return;

    // Deduct credits
    const updatedUser = { 
      ...user, 
      credits: (user.credits || 0) - PLATFORM_FEE 
    };

    // Update user state and localStorage
    setUser(updatedUser);
    
    // Update the appropriate localStorage key
    if (localStorage.getItem('promoterUser')) {
      localStorage.setItem('promoterUser', JSON.stringify(updatedUser));
    } else if (localStorage.getItem('userData')) {
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }

    // Open external link
    if (pendingPurchase.externalUrl) {
      window.open(pendingPurchase.externalUrl, '_blank');
    }

    // Show success message
    toast({
      title: "Purchase Authorized! 🛍️",
      description: `${PLATFORM_FEE} credits deducted. Redirecting to ${platforms[pendingPurchase.platform].name}...`,
    });

    // Reset modal state
    setShowFeeModal(false);
    setPendingPurchase(null);
  };

  const cancelPurchase = () => {
    setShowFeeModal(false);
    setPendingPurchase(null);
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
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/events')}
                >
                  AI Recommendations
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/pricing')}
                >
                  Pricing
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/promoter-login')}
                >
                  Promoter & Venues
                </button>
                <button 
                  className="text-slate-300 hover:text-white transition-colors"
                  onClick={() => navigate('/my-tickets')}
                >
                  My Tickets
                </button>
                <button 
                  className="text-blue-400 font-semibold"
                  onClick={() => navigate('/merchandise')}
                >
                  Merchandise
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Button variant="outline" className="relative border-slate-600 text-slate-300">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs">
                    {cart.length}
                  </Badge>
                )}
              </Button>

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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Artist Merchandise
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Official and fan-made merchandise from your favorite artists and bands. 
            Shop from trusted platforms like Etsy, Redbubble, and official stores.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for band merch, vinyl records, posters..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-lg pl-12 py-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Platform Integration Notice */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-2">🛡️ Trusted Marketplace Integration</h3>
                <p className="text-slate-300 text-sm">
                  We partner with verified platforms like Etsy, Redbubble, official band stores, and Reverb 
                  to bring you authentic merchandise. All external purchases are secured by platform guarantees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {category.name} ({category.count})
              </Button>
            );
          })}
        </div>

        {/* Merchandise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMerchandise.map((item) => {
            const platform = platforms[item.platform];
            const PlatformIcon = platform.icon;
            
            return (
              <Card key={item.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all group">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${platform.color} text-white border-0`}>
                      <PlatformIcon className="w-3 h-3 mr-1" />
                      {platform.name}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="ghost" className="bg-black/50 text-white hover:bg-black/70">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Badge className="bg-red-600 text-white">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-slate-400 text-sm">{item.artist}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-white">{item.rating}</span>
                      </div>
                      <span className="text-slate-400 text-sm">({item.reviews} reviews)</span>
                    </div>
                    
                    <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">${item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-slate-400 line-through">${item.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">by {item.seller}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {item.platform === 'official' ? (
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={!item.inStock}
                          onClick={() => addToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          disabled={!item.inStock}
                          onClick={() => handleBuyExternal(item)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buy on {platform.name}
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredMerchandise.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-700 mt-8">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No merchandise found</h3>
              <p className="text-slate-400">Try adjusting your search or browse different categories.</p>
            </CardContent>
          </Card>
        )}

        {/* Sell Your Merch CTA */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">🎨 Sell Your Own Merchandise</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Are you an artist, band, or creator? List your merchandise on our integrated platforms 
              and reach millions of music fans worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => window.open('https://www.etsy.com/sell', '_blank')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Sell on Etsy
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => window.open('https://www.redbubble.com/signup', '_blank')}
              >
                <Shirt className="w-4 h-4 mr-2" />
                Sell on Redbubble
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Music className="w-4 h-4 mr-2" />
                Official Store Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credit Fee Confirmation Modal */}
        {showFeeModal && pendingPurchase && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-700 max-w-md w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-600/20 rounded-full">
                    <AlertCircle className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <CardTitle className="text-white text-xl">External Platform Purchase</CardTitle>
                <CardDescription className="text-slate-400">
                  Confirm your purchase to continue to {platforms[pendingPurchase.platform].name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={pendingPurchase.image} 
                        alt={pendingPurchase.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-white">{pendingPurchase.name}</h4>
                        <p className="text-slate-400 text-sm">{pendingPurchase.artist}</p>
                      </div>
                    </div>
                    <Badge className={`${platforms[pendingPurchase.platform].color} text-white border-0`}>
                      {platforms[pendingPurchase.platform].name}
                    </Badge>
                  </div>
                  <div className="text-xl font-bold text-white">${pendingPurchase.price}</div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">Platform Access Fee</h4>
                      <p className="text-slate-400 text-sm">Secure purchasing through external platforms</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-400">{PLATFORM_FEE} 💳</div>
                      <div className="text-xs text-slate-500">Credits</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Current Credits:</span>
                    <span className="text-white font-semibold">{user?.credits || 0} 💳</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">After Purchase:</span>
                    <span className="text-green-400 font-semibold">
                      {(user?.credits || 0) - PLATFORM_FEE} 💳
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={cancelPurchase}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={confirmPurchase}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Confirm & Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Merchandise;