import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, 
  ArrowUpRight, ArrowDownRight, PieChart, Target, Briefcase, Star
} from 'lucide-react';
import { mockUser, mockEvents } from '../mock';
import { useToast } from '../hooks/use-toast';

const DashboardInvestor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // Mock API calls
    setUser({ ...mockUser, accountType: 'investor' });
    setPortfolio(mockUser.portfolio);
    setMarketData(mockEvents.slice(0, 3));
  }, []);

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, item) => total + (item.currentValue * item.quantity), 0);
  };

  const calculatePortfolioGain = () => {
    const purchased = portfolio.reduce((total, item) => total + (item.purchasePrice * item.quantity), 0);
    const current = calculatePortfolioValue();
    return current - purchased;
  };

  const calculatePortfolioGainPercent = () => {
    const purchased = portfolio.reduce((total, item) => total + (item.purchasePrice * item.quantity), 0);
    const gain = calculatePortfolioGain();
    return purchased > 0 ? ((gain / purchased) * 100).toFixed(1) : 0;
  };

  const handleQuickTrade = (eventId, action) => {
    toast({
      title: `${action === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `Your ${action} order for Event #${eventId} has been submitted.`,
    });
  };

  const PortfolioCard = ({ item, index }) => {
    const gain = (item.currentValue - item.purchasePrice) * item.quantity;
    const gainPercent = ((item.currentValue - item.purchasePrice) / item.purchasePrice * 100).toFixed(1);
    const isPositive = gain >= 0;

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white">Event #{item.eventId}</CardTitle>
              <CardDescription className="text-slate-300">{item.ticketType}</CardDescription>
            </div>
            <Badge className={isPositive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              {isPositive ? '+' : ''}{gainPercent}%
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Purchase Price</div>
              <div className="text-white font-medium">${item.purchasePrice}</div>
            </div>
            <div>
              <div className="text-slate-400">Current Value</div>
              <div className="text-white font-medium">${item.currentValue}</div>
            </div>
            <div>
              <div className="text-slate-400">Quantity</div>
              <div className="text-white font-medium">{item.quantity}</div>
            </div>
            <div>
              <div className="text-slate-400">Total Value</div>
              <div className="text-white font-medium">${(item.currentValue * item.quantity).toLocaleString()}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-600">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}${Math.abs(gain).toLocaleString()}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  onClick={() => handleQuickTrade(item.eventId, 'buy')}
                >
                  Buy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  onClick={() => handleQuickTrade(item.eventId, 'sell')}
                >
                  Sell
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MarketCard = ({ event }) => (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
          onClick={() => navigate(`/event/${event.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg">{event.name}</CardTitle>
            <CardDescription className="text-slate-300">{event.city}</CardDescription>
          </div>
          {event.isHot && (
            <Badge className="bg-red-600 hover:bg-red-700">
              Hot
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            ${event.currentPrice}
          </div>
          <div className={`flex items-center space-x-1 ${event.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {event.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{event.priceChangePercent}</span>
          </div>
        </div>
        
        <div className="text-sm text-slate-400">
          AI Confidence: {event.aiConfidence}% • {event.availableTickets} available
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleQuickTrade(event.id, 'buy');
            }}
          >
            Buy
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/event/${event.id}`);
            }}
          >
            View
          </Button>
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

  const portfolioValue = calculatePortfolioValue();
  const portfolioGain = calculatePortfolioGain();
  const portfolioGainPercent = calculatePortfolioGainPercent();
  const isPortfolioPositive = portfolioGain >= 0;

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
                Market
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
                onClick={() => navigate('/dashboard/fan')}
              >
                Switch to Fan View
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Investor Dashboard</h1>
          <p className="text-slate-300 text-lg">Track your ticket investments and market opportunities</p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">${portfolioValue.toLocaleString()}</div>
                <div className="text-slate-400 text-sm">Portfolio Value</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${isPortfolioPositive ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                {isPortfolioPositive ? 
                  <TrendingUp className="h-6 w-6 text-green-400" /> :
                  <TrendingDown className="h-6 w-6 text-red-400" />
                }
              </div>
              <div>
                <div className={`text-2xl font-bold ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}${Math.abs(portfolioGain).toLocaleString()}
                </div>
                <div className="text-slate-400 text-sm">Total Gain/Loss</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${isPortfolioPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPortfolioPositive ? '+' : ''}{portfolioGainPercent}%
                </div>
                <div className="text-slate-400 text-sm">Return Rate</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-amber-600/20 rounded-lg">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{portfolio.length}</div>
                <div className="text-slate-400 text-sm">Active Positions</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-slate-700">
              My Portfolio
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-slate-700">
              Market Watch
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Portfolio Holdings</h2>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/events')}
              >
                Add Position
              </Button>
            </div>

            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.map((item, index) => (
                  <PortfolioCard key={index} item={item} index={index} />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No positions yet</h3>
                  <p className="text-slate-400 mb-6">Start building your ticket investment portfolio!</p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/events')}
                  >
                    Explore Market
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Market Opportunities</h2>
              <Button 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/events')}
              >
                View Full Market
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketData.map(event => (
                <MarketCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Investment Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Performing Position</span>
                      <span className="text-green-400 font-medium">Event #3 (+104.2%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Trades</span>
                      <span className="text-white">{portfolio.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-green-400">75%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-white font-medium">Buy Signal: Taylor Swift</div>
                      <div className="text-slate-400 text-sm">High confidence (98%) • Expected +20% gain</div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-white font-medium">Hold: Drake Event</div>
                      <div className="text-slate-400 text-sm">Strong momentum • Wait for better exit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardInvestor;