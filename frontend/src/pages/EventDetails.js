import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Ticket, ArrowLeft, Calendar, MapPin, Clock, Users, TrendingUp, TrendingDown, 
  Flame, Shield, Star, ChevronRight, ShoppingCart, DollarSign, Eye 
} from 'lucide-react';
import { mockEvents } from '../mock';
import { useToast } from '../hooks/use-toast';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Mock API call - find event by ID
    const foundEvent = mockEvents.find(e => e.id === parseInt(id));
    setEvent(foundEvent);
    if (foundEvent && foundEvent.ticketTypes.length > 0) {
      setSelectedTicketType(foundEvent.ticketTypes[0].type);
    }
  }, [id]);

  const handlePurchase = () => {
    if (!selectedTicketType) {
      toast({
        title: "Please select a ticket type",
        description: "Choose a ticket type before proceeding to checkout.",
        variant: "destructive"
      });
      return;
    }

    // Store purchase data in localStorage for checkout
    const purchaseData = {
      eventId: event.id,
      eventName: event.name,
      ticketType: selectedTicketType,
      quantity: quantity,
      price: getSelectedTicketPrice()
    };
    
    localStorage.setItem('checkoutData', JSON.stringify(purchaseData));
    navigate('/checkout');
  };

  const getSelectedTicketPrice = () => {
    const ticketType = event?.ticketTypes.find(t => t.type === selectedTicketType);
    return ticketType ? ticketType.price : 0;
  };

  const getSelectedTicketAvailable = () => {
    const ticketType = event?.ticketTypes.find(t => t.type === selectedTicketType);
    return ticketType ? ticketType.available : 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative">
              <img 
                src={event.image} 
                alt={event.name}
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              
              {/* Overlays */}
              <div className="absolute top-4 left-4 flex gap-2">
                {event.isHot && (
                  <Badge className="bg-red-600 hover:bg-red-700">
                    <Flame className="w-3 h-3 mr-1" />
                    AI Hot
                  </Badge>
                )}
                <Badge className="bg-black/70 text-white">
                  {event.aiConfidence}% AI Confidence
                </Badge>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-4xl font-bold text-white mb-2">{event.name}</h1>
                <p className="text-xl text-slate-200">{event.artist}</p>
              </div>
            </div>

            {/* Event Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">{formatDate(event.date)}</div>
                      <div className="text-sm text-slate-400">Event Date</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Clock className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">{event.time}</div>
                      <div className="text-sm text-slate-400">Show Time</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-slate-300">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-white">{event.venue}</div>
                      <div className="text-sm text-slate-400">{event.city}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Users className="h-5 w-5 text-amber-400" />
                    <div>
                      <div className="font-medium text-white">{event.availableTickets} Available</div>
                      <div className="text-sm text-slate-400">of {event.totalTickets} total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{event.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Preview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Secondary Market</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    onClick={() => navigate('/marketplace')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View All Listings
                  </Button>
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Tickets being resold by other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">VIP Section • Row A</div>
                      <div className="text-slate-400 text-sm">Seller: Alex M. (4.9⭐)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">$380</div>
                      <div className="text-green-400 text-sm">+18.8%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="text-white font-medium">General Admission</div>
                      <div className="text-slate-400 text-sm">Seller: Jordan L. (4.6⭐)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">$165</div>
                      <div className="text-green-400 text-sm">+10.0%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Panel */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Current Price</CardTitle>
                  <div className={`flex items-center space-x-1 ${event.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {event.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">{event.priceChangePercent}</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  ${getSelectedTicketPrice()}
                </div>
                <CardDescription className="text-slate-300">
                  Base price: ${event.basePrice}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ticket Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Ticket Type</label>
                  <Select value={selectedTicketType} onValueChange={setSelectedTicketType}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {event.ticketTypes.map((ticket) => (
                        <SelectItem 
                          key={ticket.type} 
                          value={ticket.type}
                          className="text-white hover:bg-slate-600"
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{ticket.type}</span>
                            <span className="ml-4">${ticket.price} ({ticket.available} left)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Quantity</label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {[...Array(Math.min(4, getSelectedTicketAvailable()))].map((_, i) => (
                        <SelectItem 
                          key={i + 1} 
                          value={(i + 1).toString()}
                          className="text-white hover:bg-slate-600"
                        >
                          {i + 1} ticket{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total */}
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300">Total ({quantity} tickets)</span>
                    <span className="text-2xl font-bold text-white">
                      ${(getSelectedTicketPrice() * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={handlePurchase}
                    disabled={getSelectedTicketAvailable() === 0}
                  >
                    {getSelectedTicketAvailable() === 0 ? 'Sold Out' : 'Buy Tickets'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white py-6"
                    onClick={() => navigate('/marketplace')}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Buy from Marketplace
                  </Button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-sm mt-4">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout with blockchain verification</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="mr-2 h-5 w-5 text-amber-400" />
                  AI Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Demand Level</span>
                    <span className="text-amber-400 font-medium">Very High</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                    <div className="bg-amber-400 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
                
                <div className="text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Price Volatility</span>
                    <span className="text-green-400 font-medium">Stable</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                    <div className="bg-green-400 h-2 rounded-full w-[60%]"></div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-600">
                  AI predicts price may increase by 15-25% closer to event date
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;