import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, User, Calendar, DollarSign, BarChart3, Plus, Settings, 
  LogOut, CreditCard, TrendingUp, Users, Zap, MapPin, Clock,
  Image as ImageIcon, Tag, Trash2, Eye, Edit, Rocket, Star
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PromoterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'music',
    location: '',
    venue: '',
    price: '',
    availableTickets: '100',
    ageRestriction: 'all-ages',
    duration: '',
    imageUrl: '',
    tags: []
  });

  useEffect(() => {
    // Check if user is logged in as promoter
    const userData = localStorage.getItem('promoterUser');
    if (!userData) {
      navigate('/promoter-login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Load user's events from localStorage
    const userEvents = localStorage.getItem(`events_${parsedUser.id}`) || '[]';
    setEvents(JSON.parse(userEvents));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('promoterUser');
    navigate('/');
  };

  const handleBoostEvent = (eventId, boostPackage) => {
    const costs = {
      basic: 5,
      premium: 15,
      platinum: 30
    };
    
    const cost = costs[boostPackage];
    
    if (user.credits < cost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${cost} credits for ${boostPackage} boost. Current balance: ${user.credits}`,
        variant: "destructive"
      });
      return;
    }

    // Update event with boost
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const multiplier = { basic: 1.5, premium: 3, platinum: 5 }[boostPackage];
        return {
          ...event,
          boosted: true,
          boostLevel: boostPackage,
          boostExpiry: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days
          interestedCount: Math.floor(event.interestedCount * multiplier),
          views: Math.floor(event.views * multiplier) + Math.floor(Math.random() * 100)
        };
      }
      return event;
    });

    // Deduct credits
    const updatedUser = { ...user, credits: user.credits - cost };

    // Update state and localStorage
    setEvents(updatedEvents);
    setUser(updatedUser);
    localStorage.setItem(`events_${user.id}`, JSON.stringify(updatedEvents));
    localStorage.setItem('promoterUser', JSON.stringify(updatedUser));

    toast({
      title: "Event Boosted! 🚀",
      description: `Your event has been boosted with ${boostPackage} package for 7 days!`,
    });
  };

  const handleInputChange = (field, value) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5 && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleCreateEvent = () => {
    // Validation
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.time || !eventForm.location || !eventForm.price) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    if (user.credits < 1.5) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1.5 credits to create an event.",
        variant: "destructive"
      });
      return;
    }

    // Create new event
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      tags: tags,
      createdAt: new Date().toISOString(),
      status: 'active',
      promoterId: user.id,
      views: 0,
      interestedCount: Math.floor(Math.random() * 50)
    };

    // Update events list
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem(`events_${user.id}`, JSON.stringify(updatedEvents));

    // Deduct credits
    const updatedUser = { ...user, credits: user.credits - 1.5 };
    setUser(updatedUser);
    localStorage.setItem('promoterUser', JSON.stringify(updatedUser));

    // Reset form
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      category: 'music',
      location: '',
      venue: '',
      price: '',
      availableTickets: '100',
      ageRestriction: 'all-ages',
      duration: '',
      imageUrl: '',
      tags: []
    });
    setTags([]);

    toast({
      title: "Event Created Successfully!",
      description: `Your event "${newEvent.title}" is now live and searchable.`,
    });

    setActiveTab('my-events');
  };

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'active').length,
    boostedEvents: events.filter(e => e.boosted).length,
    creditsSpent: events.length * 1.5
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
              <Badge className="bg-slate-700 text-slate-300">
                AI-Powered Events
              </Badge>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button 
                className="text-slate-300 hover:text-white transition-colors"
                onClick={() => navigate('/events')}
              >
                Events
              </button>
              <button className="text-slate-300 hover:text-white transition-colors">AI Recommendations</button>
              <button 
                className="text-slate-300 hover:text-white transition-colors"
                onClick={() => navigate('/pricing')}
              >
                Pricing
              </button>
              <button className="text-blue-400 font-medium">Promoter & Venues</button>
              <button className="text-slate-300 hover:text-white transition-colors">My Tickets</button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-slate-800 rounded-lg px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">T</span>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-slate-400">{user.email}</div>
                </div>
                <div className="flex items-center space-x-1 text-green-400">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold">{user.credits} credits</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Promoter Dashboard</h1>
          <p className="text-slate-300 text-lg">
            Welcome back, {user.name} • {user.company || 'Demo Events LLC'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">💳 {user.credits}</div>
              <div className="text-slate-400 text-sm">Credit Balance</div>
              <Button 
                size="sm" 
                className="mt-3 bg-green-600 hover:bg-green-700 text-xs"
                onClick={() => navigate('/pricing')}
              >
                Buy Credits
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.totalEvents}</div>
              <div className="text-slate-400 text-sm">Total Events</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.activeEvents}</div>
              <div className="text-slate-400 text-sm">Active Events</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-amber-600/20 rounded-lg">
                  <Zap className="h-6 w-6 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.boostedEvents}</div>
              <div className="text-slate-400 text-sm">Boosted Events</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.creditsSpent}</div>
              <div className="text-slate-400 text-sm">Credits Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="my-events" className="data-[state=active]:bg-slate-700">
              My Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="create-event" className="data-[state=active]:bg-slate-700">
              Create Event
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab('create-event')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Event
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => navigate('/pricing')}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy More Credits
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{event.title}</div>
                            <div className="text-slate-400 text-sm">{new Date(event.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">No events created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Events Tab */}
          <TabsContent value="my-events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Events</h2>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setActiveTab('create-event')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card key={event.id} className="bg-slate-900/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge className={`${event.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} mb-2`}>
                          {event.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-white">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-slate-300">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>${event.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Interested: {event.interestedCount}</span>
                        <span className="text-slate-400">Views: {event.views}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
                  <p className="text-slate-400 mb-6">Create your first event to get started!</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab('create-event')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Event Tab */}
          <TabsContent value="create-event" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Event</CardTitle>
                    <CardDescription className="text-slate-300">
                      Cost: 1.5 credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="title" className="text-slate-200">Event Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter your event title"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description" className="text-slate-200">Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your event, what attendees can expect..."
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[120px]"
                          value={eventForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-slate-200">Date & Time *</Label>
                        <Input
                          id="date"
                          type="date"
                          className="bg-slate-800 border-slate-600 text-white"
                          value={eventForm.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-slate-200">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          className="bg-slate-800 border-slate-600 text-white"
                          value={eventForm.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-slate-200">Category</Label>
                        <Select value={eventForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="music" className="text-white hover:bg-slate-700">Music</SelectItem>
                            <SelectItem value="sports" className="text-white hover:bg-slate-700">Sports</SelectItem>
                            <SelectItem value="arts" className="text-white hover:bg-slate-700">Arts & Culture</SelectItem>
                            <SelectItem value="business" className="text-white hover:bg-slate-700">Business</SelectItem>
                            <SelectItem value="food" className="text-white hover:bg-slate-700">Food & Drink</SelectItem>
                            <SelectItem value="technology" className="text-white hover:bg-slate-700">Technology</SelectItem>
                            <SelectItem value="other" className="text-white hover:bg-slate-700">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-200">Location *</Label>
                        <Input
                          id="location"
                          placeholder="City, State or Full Address"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venue" className="text-slate-200">Venue</Label>
                        <Input
                          id="venue"
                          placeholder="Venue name (optional)"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.venue}
                          onChange={(e) => handleInputChange('venue', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-slate-200">Ticket Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tickets" className="text-slate-200">Available Tickets *</Label>
                        <Input
                          id="tickets"
                          type="number"
                          placeholder="100"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.availableTickets}
                          onChange={(e) => handleInputChange('availableTickets', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-slate-200">Age Restriction</Label>
                        <Select value={eventForm.ageRestriction} onValueChange={(value) => handleInputChange('ageRestriction', value)}>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="all-ages" className="text-white hover:bg-slate-700">All Ages</SelectItem>
                            <SelectItem value="18+" className="text-white hover:bg-slate-700">18+</SelectItem>
                            <SelectItem value="21+" className="text-white hover:bg-slate-700">21+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-slate-200">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 2 hours, 3 days"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="image" className="text-slate-200">Event Image URL</Label>
                        <Input
                          id="image"
                          placeholder="https://example.com/image.jpg (optional)"
                          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={eventForm.imageUrl}
                          onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                        />
                        <p className="text-xs text-slate-400">Recommended size: 800x400px. Leave blank for default image.</p>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <Label className="text-slate-200">Tags (up to 5)</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a tag..."
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddTag}
                            disabled={tags.length >= 5}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Add Tag
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <Badge key={index} className="bg-slate-700 text-slate-300 pr-1">
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                      onClick={handleCreateEvent}
                      disabled={user.credits < 1.5}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create Event (1.5 credits)
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Your Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">💳 {user.credits}</div>
                    <p className="text-slate-400 text-sm mb-4">credits available</p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/pricing')}
                    >
                      Buy More Credits
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Tips for Success</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Use clear, descriptive titles that include the event type</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Add relevant tags to improve discoverability</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Include high-quality images for better engagement</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Provide detailed descriptions of what attendees can expect</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PromoterDashboard;