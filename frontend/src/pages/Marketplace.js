import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, ArrowLeft, TrendingUp, TrendingDown, Calendar, MapPin, Users, 
  Search, Filter, ShoppingCart, DollarSign, Clock, Shield
} from 'lucide-react';
import { mockEvents } from '../mock';
import { useToast } from '../hooks/use-toast';

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-low');
  const [filterBy, setFilterBy] = useState('all');

  // Mock marketplace listings - tickets being sold by users
  const [marketplaceListings] = useState([
    {
      id: 1,
      eventId: 1,
      eventName: "Drake - One Dance World Tour",
      date: "2025-11-15",
      time: "20:00",
      venue: "Madison Square Garden",
      city: "New York",
      section: "VIP",
      row: "A",
      seat: "12",
      originalPrice: 320,
      askingPrice: 380,
      priceChange: 60,
      priceChangePercent: "+18.8%",
      seller: "Alex M.",
      sellerRating: 4.9,
      listedDate: "2025-09-10",
      verified: true,
      tags: ["VIP", "Premium Location"]
    },
    {
      id: 2,
      eventId: 3,
      eventName: "Taylor Swift - Eras Tour",
      date: "2025-10-28",
      time: "19:00",
      venue: "SoFi Stadium",
      city: "Los Angeles",
      section: "Floor",
      row: "F",
      seat: "145",
      originalPrice: 180,
      askingPrice: 320,
      priceChange: 140,
      priceChangePercent: "+77.8%",
      seller: "Sarah K.",
      sellerRating: 4.8,
      listedDate: "2025-09-12",
      verified: true,
      tags: ["Floor Seats", "High Demand"]
    },
    {
      id: 3,
      eventId: 2,
      eventName: "Hamilton - Broadway Musical",
      date: "2025-12-03",
      time: "19:30",
      venue: "Richard Rodgers Theatre",
      city: "New York",
      section: "Orchestra",
      row: "H",
      seat: "15",
      originalPrice: 220,
      askingPrice: 195,
      priceChange: -25,
      priceChangePercent: "-11.4%",
      seller: "Mike R.",
      sellerRating: 4.7,
      listedDate: "2025-09-13",
      verified: true,
      tags: ["Orchestra", "Broadway"]
    },
    {
      id: 4,
      eventId: 1,
      eventName: "Drake - One Dance World Tour",
      date: "2025-11-15",
      time: "20:00",
      venue: "Madison Square Garden",
      city: "New York",
      section: "General Admission",
      row: "GA",
      seat: "Standing",
      originalPrice: 150,
      askingPrice: 165,
      priceChange: 15,
      priceChangePercent: "+10.0%",
      seller: "Jordan L.",
      sellerRating: 4.6,
      listedDate: "2025-09-11",
      verified: true,
      tags: ["General Admission"]
    }
  ]);

  const filteredAndSortedListings = marketplaceListings
    .filter(listing => {
      const matchesSearch = listing.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'profit') return matchesSearch && listing.priceChange > 0;
      if (filterBy === 'discount') return matchesSearch && listing.priceChange < 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return b.askingPrice - a.askingPrice;
        case 'price-low':
          return a.askingPrice - b.askingPrice;
        case 'profit':
          return b.priceChange - a.priceChange;
        case 'date':
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });

  const handleBuyTicket = (listing) => {
    // Store purchase data for checkout
    const purchaseData = {
      eventId: listing.eventId,
      eventName: listing.eventName,
      ticketType: listing.section,
      quantity: 1,
      price: listing.askingPrice,
      isMarketplace: true,
      seller: listing.seller,
      ticketDetails: {
        section: listing.section,
        row: listing.row,
        seat: listing.seat
      }
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(purchaseData));
    navigate('/checkout');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const MarketplaceCard = ({ listing }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg">{listing.eventName}</CardTitle>
            <CardDescription className="text-slate-300">
              {listing.section} • Row {listing.row} • Seat {listing.seat}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {listing.verified && (
              <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <div className={`flex items-center space-x-1 text-sm ${listing.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {listing.priceChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{listing.priceChangePercent}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(listing.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <MapPin className="h-4 w-4" />
            <span>{listing.city}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Users className="h-4 w-4" />
            <span>{listing.seller} ({listing.sellerRating}⭐)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>Listed {formatDate(listing.listedDate)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {listing.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-600">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              ${listing.askingPrice.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">
              Original: ${listing.originalPrice}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => navigate(`/event/${listing.eventId}`)}
            >
              Event Details
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleBuyTicket(listing)}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => navigate('/events')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">TicketAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
                onClick={() => navigate('/dashboard/fan')}
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/sell-ticket')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Sell Tickets
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Ticket Marketplace</h1>
            <p className="text-slate-300 text-lg">
              Buy and sell tickets from verified users. {filteredAndSortedListings.length} listings available.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search events, artists, or sellers..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Listings</SelectItem>
                  <SelectItem value="profit" className="text-white hover:bg-slate-700">Above Face Value</SelectItem>
                  <SelectItem value="discount" className="text-white hover:bg-slate-700">Below Face Value</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="price-low" className="text-white hover:bg-slate-700">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-slate-700">Price: High to Low</SelectItem>
                  <SelectItem value="profit" className="text-white hover:bg-slate-700">Highest Profit</SelectItem>
                  <SelectItem value="date" className="text-white hover:bg-slate-700">Event Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Marketplace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {marketplaceListings.length}
              </div>
              <div className="text-slate-400 text-sm">Active Listings</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {marketplaceListings.filter(l => l.priceChange > 0).length}
              </div>
              <div className="text-slate-400 text-sm">Above Face Value</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {marketplaceListings.filter(l => l.priceChange < 0).length}
              </div>
              <div className="text-slate-400 text-sm">Below Face Value</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                ${Math.round(marketplaceListings.reduce((sum, l) => sum + l.askingPrice, 0) / marketplaceListings.length).toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">Avg. Price</div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedListings.map(listing => (
            <MarketplaceCard key={listing.id} listing={listing} />
          ))}
        </div>

        {filteredAndSortedListings.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg">No listings found matching your criteria.</div>
            <Button 
              variant="outline" 
              className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => {
                setSearchTerm('');
                setFilterBy('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;