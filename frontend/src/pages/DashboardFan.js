import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, User, Calendar, Wallet, TrendingUp, QrCode, Download, 
  Share2, ArrowRight, Clock, MapPin, Star
} from 'lucide-react';
import { mockTickets, mockUser } from '../mock';
import { useToast } from '../hooks/use-toast';

const DashboardFan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Mock API calls
    setUser(mockUser);
    setTickets(mockTickets);
  }, []);

  const handleDownloadTicket = (ticketId) => {
    toast({
      title: "Ticket Downloaded",
      description: `Ticket ${ticketId} has been downloaded to your device.`,
    });
  };

  const handleShareTicket = (ticketId) => {
    toast({
      title: "Share Link Copied",
      description: `Sharing link for ticket ${ticketId} copied to clipboard.`,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const TicketCard = ({ ticket }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg">{ticket.eventName}</CardTitle>
            <CardDescription className="text-slate-300">
              {ticket.section} • Seat {ticket.seat}
            </CardDescription>
          </div>
          <Badge 
            className={ticket.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600'}
          >
            {ticket.status === 'active' ? 'Active' : 'Used'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-300">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(ticket.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{formatTime(ticket.time)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <MapPin className="h-4 w-4" />
            <span>{ticket.venue}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Wallet className="h-4 w-4" />
            <span>${ticket.price}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-600">
          <div className="flex items-center space-x-2 text-slate-400">
            <QrCode className="h-4 w-4" />
            <span className="text-xs font-mono">{ticket.qrCode}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => handleDownloadTicket(ticket.id)}
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => handleShareTicket(ticket.id)}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">TicketAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
                onClick={() => navigate('/events')}
              >
                Browse Events
              </Button>
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
                onClick={() => navigate('/marketplace')}
              >
                Marketplace
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/sell-ticket')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Sell Tickets
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {user.name}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
          <p className="text-slate-300 text-lg">Manage your tickets and discover new events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{tickets.length}</div>
                <div className="text-slate-400 text-sm">Active Tickets</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.eventsAttended}</div>
                <div className="text-slate-400 text-sm">Events Attended</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${user.totalSpent.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">Total Spent</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-600/20 rounded-lg">
                <Star className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Fan</div>
                <div className="text-slate-400 text-sm">Account Type</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="tickets" className="data-[state=active]:bg-slate-700">
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700">
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-slate-700">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Tickets</h2>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/events')}
              >
                Buy More Tickets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map(ticket => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Ticket className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No tickets yet</h3>
                  <p className="text-slate-400 mb-6">Start exploring events and get your first tickets!</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/events')}
                  >
                    Browse Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      <Ticket className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Purchased tickets for Taylor Swift - Eras Tour</div>
                      <div className="text-slate-400 text-sm">2 hours ago • $245</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Download className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">Downloaded ticket for Drake - One Dance World Tour</div>
                      <div className="text-slate-400 text-sm">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Ticket Portfolio</h2>
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/dashboard/investor')}
              >
                Switch to Investor View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.portfolio.map((item, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Event #{item.eventId}</span>
                      <div className={`flex items-center space-x-1 ${item.currentValue > item.purchasePrice ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">
                          {item.currentValue > item.purchasePrice ? '+' : ''}
                          ${item.currentValue - item.purchasePrice}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Ticket Type</span>
                        <span className="text-white">{item.ticketType}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Purchase Price</span>
                        <span className="text-white">${item.purchasePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Current Value</span>
                        <span className="text-white">${item.currentValue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Quantity</span>
                        <span className="text-white">{item.quantity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardFan;