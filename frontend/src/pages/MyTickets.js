import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, User, Calendar, DollarSign, MapPin, Clock, 
  Download, Share, QrCode, Search, Filter, Star,
  ExternalLink, Mail, CreditCard, LogOut
} from 'lucide-react';

const MyTickets = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData') || localStorage.getItem('promoterUser');
    if (!userData) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load user's tickets from localStorage
    const userTickets = localStorage.getItem(`tickets_${parsedUser.id}`) || '[]';
    setTickets(JSON.parse(userTickets));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('promoterUser');
    navigate('/');
  };

  // Mock tickets for demonstration
  const mockTickets = [
    {
      id: 'ticket-1',
      eventName: 'Arctic Monkeys Live',
      venue: 'Madison Square Garden',
      date: '2024-12-15',
      time: '20:00',
      location: 'New York, NY',
      price: 89,
      quantity: 2,
      status: 'confirmed',
      qrCode: 'QR123456789',
      section: 'Floor A',
      row: '12',
      seats: ['15', '16'],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop'
    },
    {
      id: 'ticket-2',
      eventName: 'AI & Machine Learning Summit',
      venue: 'Javits Center',
      date: '2025-01-10',
      time: '09:00',
      location: 'New York, NY',
      price: 299,
      quantity: 1,
      status: 'upcoming',
      qrCode: 'QR987654321',
      section: 'General Admission',
      row: 'N/A',
      seats: ['GA'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop'
    }
  ];

  const allTickets = tickets.length > 0 ? tickets : mockTickets;
  
  const upcomingTickets = allTickets.filter(ticket => new Date(ticket.date) > new Date());
  const pastTickets = allTickets.filter(ticket => new Date(ticket.date) <= new Date());
  
  const totalSpent = allTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);

  const stats = {
    totalTickets: allTickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
    upcomingEvents: upcomingTickets.length,
    totalSpent: totalSpent
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
                  className="text-blue-400 font-semibold"
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Tickets</h1>
          <p className="text-slate-400 text-lg">
            Welcome back, {user.name || user.email.split('@')[0]}!
          </p>
          <p className="text-slate-500">{user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Ticket className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalTickets}</div>
              <div className="text-slate-400 text-sm">Total Tickets</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.upcomingEvents}</div>
              <div className="text-slate-400 text-sm">Upcoming Events</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">${stats.totalSpent.toFixed(2)}</div>
              <div className="text-slate-400 text-sm">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
                All Tickets ({allTickets.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-slate-700">
                Upcoming ({upcomingTickets.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-slate-700">
                Past Events ({pastTickets.length})
              </TabsTrigger>
            </TabsList>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/events')}
            >
              Browse Events
            </Button>
          </div>

          <TabsContent value="all">
            {allTickets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {allTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-all">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={ticket.image} 
                          alt={ticket.eventName}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-white text-lg">{ticket.eventName}</h3>
                            <p className="text-slate-400 text-sm">{ticket.venue}</p>
                          </div>
                          <Badge className={`${
                            ticket.status === 'confirmed' ? 'bg-green-600' : 
                            ticket.status === 'upcoming' ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{ticket.date} at {ticket.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Ticket className="w-4 h-4" />
                            <span>{ticket.section} - Row {ticket.row} - Seats {ticket.seats.join(', ')}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-white">
                            ${ticket.price} × {ticket.quantity}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                              <Share className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Ticket className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No tickets yet</h3>
                  <p className="text-slate-400 mb-6">You haven't booked any tickets yet. Discover amazing events and book your first ticket!</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/events')}
                  >
                    Discover Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingTickets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-slate-900/50 border-slate-700">
                    {/* Same ticket card structure as above */}
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={ticket.image} 
                          alt={ticket.eventName}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-white text-lg">{ticket.eventName}</h3>
                            <p className="text-slate-400 text-sm">{ticket.venue}</p>
                          </div>
                          <Badge className="bg-blue-600">upcoming</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{ticket.date} at {ticket.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-white">
                            ${ticket.price} × {ticket.quantity}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No upcoming events</h3>
                  <p className="text-slate-400 mb-6">You don't have any upcoming events. Browse and book tickets for amazing events!</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/events')}
                  >
                    Find Events
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastTickets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastTickets.map((ticket) => (
                  <Card key={ticket.id} className="bg-slate-900/50 border-slate-700 opacity-75">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={ticket.image} 
                          alt={ticket.eventName}
                          className="w-full h-full object-cover rounded-l-lg grayscale"
                        />
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-white text-lg">{ticket.eventName}</h3>
                            <p className="text-slate-400 text-sm">{ticket.venue}</p>
                          </div>
                          <Badge className="bg-gray-600">completed</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-slate-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{ticket.date} at {ticket.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-white">
                            ${ticket.price} × {ticket.quantity}
                          </div>
                          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                            <Star className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No past events</h3>
                  <p className="text-slate-400">Your event history will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTickets;