import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { 
  DollarSign, Users, Calendar, TrendingUp, Eye, Mail, 
  BarChart3, Plus, Edit, Download, ExternalLink, MapPin,
  Clock, Ticket, Video, MessageCircle, Heart, Zap,
  Settings, LogOut, CreditCard, Star, Target, Send,
  UserPlus, Filter, Search, AlertCircle, CheckCircle
} from 'lucide-react';

const PromoterCRM = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Check if user is logged in as promoter
    const userData = localStorage.getItem('promoterUser');
    if (!userData) {
      navigate('/promoter-login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load CRM data
    loadDashboardData();
    loadEvents();
    loadContacts();
    loadCampaigns();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('promoterUser');
    navigate('/');
  };

  const loadDashboardData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/crm/dashboard/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData({
          totalRevenue: data.total_revenue_mtd,
          ticketsSold: data.tickets_sold,
          activeEvents: data.active_events,
          streamRevenue: data.stream_revenue,
          pendingPayouts: data.pending_payouts,
          revenueGrowth: data.revenue_growth,
          audienceGrowth: data.audience_growth,
          conversionRate: data.conversion_rate,
          avgTicketPrice: data.avg_ticket_price
        });
      } else {
        // Fallback to mock data if API fails
        const mockData = {
          totalRevenue: 18240,
          ticketsSold: 3420,
          activeEvents: 6,
          streamRevenue: 1980,
          pendingPayouts: 2560,
          revenueGrowth: 12.5,
          audienceGrowth: 8.3,
          conversionRate: 3.2,
          avgTicketPrice: 45.50
        };
        setDashboardData(mockData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      const mockData = {
        totalRevenue: 18240,
        ticketsSold: 3420,
        activeEvents: 6,
        streamRevenue: 1980,
        pendingPayouts: 2560,
        revenueGrowth: 12.5,
        audienceGrowth: 8.3,
        conversionRate: 3.2,
        avgTicketPrice: 45.50
      };
      setDashboardData(mockData);
    }
  };

  const loadEvents = () => {
    // Mock events data
    const mockEvents = [
      {
        id: 'event-1',
        name: 'TechFest 2025',
        status: 'active',
        date: '2024-12-15',
        ticketsSold: 950,
        capacity: 1200,
        revenue: 11400,
        streamViewers: 2340,
        engagement: 85,
        category: 'Technology'
      },
      {
        id: 'event-2',
        name: 'Music Night LA',
        status: 'scheduled',
        date: '2024-12-20',
        ticketsSold: 400,
        capacity: 800,
        revenue: 6000,
        streamViewers: 0,
        engagement: 92,
        category: 'Music'
      },
      {
        id: 'event-3',
        name: 'Comedy Jam',
        status: 'completed',
        date: '2024-11-25',
        ticketsSold: 320,
        capacity: 350,
        revenue: 3200,
        streamViewers: 890,
        engagement: 78,
        category: 'Comedy'
      }
    ];
    setEvents(mockEvents);
  };

  const loadContacts = () => {
    // Mock contacts data
    const mockContacts = [
      {
        id: 'contact-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        purchaseHistory: 4,
        lastEvent: 'TechFest 2025',
        engagementScore: 95,
        totalSpent: 180,
        location: 'Los Angeles, CA'
      },
      {
        id: 'contact-2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        purchaseHistory: 7,
        lastEvent: 'Music Night LA',
        engagementScore: 88,
        totalSpent: 315,
        location: 'San Francisco, CA'
      },
      {
        id: 'contact-3',
        name: 'Emma Davis',
        email: 'emma@example.com',
        purchaseHistory: 2,
        lastEvent: 'Comedy Jam',
        engagementScore: 72,
        totalSpent: 90,
        location: 'New York, NY'
      }
    ];
    setContacts(mockContacts);
  };

  const loadCampaigns = () => {
    // Mock campaigns data
    const mockCampaigns = [
      {
        id: 'campaign-1',
        name: 'TechFest Early Bird',
        type: 'email',
        status: 'active',
        sent: 2450,
        opened: 1840,
        clicked: 340,
        converted: 85,
        revenue: 4250
      },
      {
        id: 'campaign-2',
        name: 'VIP Upgrade Offer',
        type: 'notification',
        status: 'completed',
        sent: 950,
        opened: 720,
        clicked: 180,
        converted: 45,
        revenue: 2250
      }
    ];
    setCampaigns(mockCampaigns);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'scheduled': return 'bg-blue-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-slate-600';
    }
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
      {/* Header */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TicketAI CRM
                  </span>
                  <div className="text-xs text-slate-400">Promoter Dashboard</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/promoter-dashboard')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              
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
                <div className="flex items-center space-x-1 text-green-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-semibold">{user.credits || 42} credits</span>
                </div>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700 grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-slate-700">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="marketing" className="data-[state=active]:bg-slate-700">
              <Mail className="w-4 h-4 mr-2" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="payouts" className="data-[state=active]:bg-slate-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Payouts
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Revenue (MTD)</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(dashboardData.totalRevenue)}</p>
                      <p className="text-green-400 text-sm mt-1">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        +{dashboardData.revenueGrowth}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-600/20 rounded-full">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Tickets Sold</p>
                      <p className="text-3xl font-bold text-white">{dashboardData.ticketsSold?.toLocaleString()}</p>
                      <p className="text-blue-400 text-sm mt-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        +{dashboardData.audienceGrowth}%
                      </p>
                    </div>
                    <div className="p-3 bg-blue-600/20 rounded-full">
                      <Ticket className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Events</p>
                      <p className="text-3xl font-bold text-white">{dashboardData.activeEvents}</p>
                      <p className="text-purple-400 text-sm mt-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        This month
                      </p>
                    </div>
                    <div className="p-3 bg-purple-600/20 rounded-full">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Stream Revenue (24h)</p>
                      <p className="text-3xl font-bold text-white">{formatCurrency(dashboardData.streamRevenue)}</p>
                      <p className="text-red-400 text-sm mt-1">
                        <Video className="w-4 h-4 inline mr-1" />
                        Live streaming
                      </p>
                    </div>
                    <div className="p-3 bg-red-600/20 rounded-full">
                      <Video className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Breakdown</CardTitle>
                  <CardDescription className="text-slate-400">Last 30 days performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Ticket Sales</span>
                      <span className="text-white font-semibold">{formatCurrency(12800)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Live Streams</span>
                      <span className="text-white font-semibold">{formatCurrency(4200)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Merchandise</span>
                      <span className="text-white font-semibold">{formatCurrency(1240)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Top Events by Revenue</CardTitle>
                  <CardDescription className="text-slate-400">This month's best performers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{event.name}</p>
                            <p className="text-slate-400 text-sm">{event.ticketsSold} tickets sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{formatCurrency(event.revenue)}</p>
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-400" />
                  AI Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">Optimization Opportunity</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Your tech events perform 35% better on Thursday evenings. Consider scheduling your next TechFest on Dec 19th at 7 PM.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">Market Trend</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    "Hybrid events" are trending +45% in your area. Adding live streaming could increase revenue by an estimated $2,800.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-purple-400">Audience Insight</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    25% of your attendees are repeat customers. Consider launching a loyalty program to increase retention.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Event Management</h2>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{event.name}</h3>
                          <p className="text-slate-400">{event.date} • {event.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Tickets Sold</p>
                          <p className="text-white font-semibold">{event.ticketsSold}/{event.capacity}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Revenue</p>
                          <p className="text-white font-semibold">{formatCurrency(event.revenue)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">Stream Views</p>
                          <p className="text-white font-semibold">{event.streamViewers?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} text-white`}>
                          {event.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Audience Analytics</h2>
              <div className="flex space-x-3">
                <Input 
                  placeholder="Search contacts..." 
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{contacts.length.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">Total Contacts</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">85%</p>
                  <p className="text-slate-400 text-sm">Avg Engagement</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{formatCurrency(195)}</p>
                  <p className="text-slate-400 text-sm">Avg Customer Value</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Database</CardTitle>
                <CardDescription className="text-slate-400">Manage your audience relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{contact.name}</p>
                          <p className="text-slate-400 text-sm">{contact.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">Purchases</p>
                          <p className="text-white font-semibold">{contact.purchaseHistory}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Total Spent</p>
                          <p className="text-white font-semibold">{formatCurrency(contact.totalSpent)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Engagement</p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-white font-semibold">{contact.engagementScore}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-xs">{contact.location}</span>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Marketing Campaigns</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Email Blast
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Discount Code
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Launch Targeted Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">AI Marketing Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-400 font-semibold text-sm mb-1">Best Send Time</p>
                      <p className="text-slate-300 text-sm">Tuesday 2 PM gets 40% higher open rates</p>
                    </div>
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 font-semibold text-sm mb-1">Target Audience</p>
                      <p className="text-slate-300 text-sm">Tech professionals age 25-40 convert best</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-white font-semibold">{campaign.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={`text-xs ${campaign.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}`}>
                              {campaign.status}
                            </Badge>
                            <span className="text-slate-400 text-sm">{campaign.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{formatCurrency(campaign.revenue)}</p>
                          <p className="text-slate-400 text-sm">Revenue</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">Sent</p>
                          <p className="text-white font-semibold">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Opened</p>
                          <p className="text-white font-semibold">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Clicked</p>
                          <p className="text-white font-semibold">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Converted</p>
                          <p className="text-white font-semibold">{((campaign.converted / campaign.sent) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Payouts & Financials</h2>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{formatCurrency(dashboardData.pendingPayouts)}</p>
                  <p className="text-slate-400 text-sm">Pending Payouts</p>
                  <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                    Withdraw Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{formatCurrency(15480)}</p>
                  <p className="text-slate-400 text-sm">Paid This Month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{formatCurrency(dashboardData.avgTicketPrice)}</p>
                  <p className="text-slate-400 text-sm">Avg Transaction</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 'TX-34591', date: 'Oct 8', amount: 450, type: 'Stream Tips', status: 'Paid' },
                    { id: 'TX-34602', date: 'Oct 9', amount: 2100, type: 'Ticket Sales', status: 'Pending' },
                    { id: 'TX-34603', date: 'Oct 10', amount: 890, type: 'Merchandise', status: 'Paid' },
                    { id: 'TX-34604', date: 'Oct 11', amount: 1250, type: 'VIP Access', status: 'Pending' }
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{transaction.id}</p>
                          <p className="text-slate-400 text-sm">{transaction.date} • {transaction.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <p className="text-white font-semibold">{formatCurrency(transaction.amount)}</p>
                        <Badge className={`text-xs ${transaction.status === 'Paid' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PromoterCRM;