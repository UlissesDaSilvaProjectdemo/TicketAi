import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Ticket, Search, TrendingUp, TrendingDown, Calendar, MapPin, Users, Flame, ArrowLeft, Filter, ShoppingCart } from 'lucide-react';
import { mockEvents } from '../mock';

const EventFeed = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    // Mock API call - load events
    setEvents(mockEvents);
  }, []);

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.artist.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'hot') return matchesSearch && event.isHot;
      if (filterBy === 'available') return matchesSearch && event.availableTickets > 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return b.currentPrice - a.currentPrice;
        case 'price-low':
          return a.currentPrice - b.currentPrice;
        case 'demand':
          return (b.totalTickets - b.availableTickets) - (a.totalTickets - a.availableTickets);
        case 'date':
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const EventCard = ({ event }) => (
    <Card 
      className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all cursor-pointer group"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {event.isHot && (
          <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700">
            <Flame className="w-3 h-3 mr-1" />
            AI Hot
          </Badge>
        )}
        <div className="absolute top-3 right-3 bg-black/70 rounded-lg px-2 py-1">
          <span className="text-white text-sm font-semibold">
            {event.aiConfidence}% AI
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
              {event.name}
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm">
              {event.artist}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center space-x-4 text-sm text-slate-300">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{event.city}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              ${event.currentPrice}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${event.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {event.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{event.priceChangePercent}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm text-slate-300">
              <Users className="w-4 h-4" />
              <span>{event.availableTickets} left</span>
            </div>
            <div className="text-xs text-slate-400">
              of {event.totalTickets} total
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {event.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {tag}
            </Badge>
          ))}
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
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
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
                onClick={() => navigate('/marketplace')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Marketplace
              </Button>
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
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Live Event Market</h1>
            <p className="text-slate-300 text-lg">
              Trade tickets like stocks. {events.length} events available for trading.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search events, artists, or cities..."
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
                  <SelectItem value="all" className="text-white hover:bg-slate-700">All Events</SelectItem>
                  <SelectItem value="hot" className="text-white hover:bg-slate-700">AI Hot</SelectItem>
                  <SelectItem value="available" className="text-white hover:bg-slate-700">Available</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="date" className="text-white hover:bg-slate-700">Sort by Date</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-slate-700">Price: High to Low</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-slate-700">Price: Low to High</SelectItem>
                  <SelectItem value="demand" className="text-white hover:bg-slate-700">Highest Demand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg">No events found matching your criteria.</div>
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

export default EventFeed;