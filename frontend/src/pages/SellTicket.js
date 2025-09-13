import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Ticket, ArrowLeft, DollarSign, Upload, Shield, TrendingUp, 
  Calendar, MapPin, Users, CheckCircle
} from 'lucide-react';
import { mockTickets } from '../mock';
import { useToast } from '../hooks/use-toast';

const SellTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState('');
  const [listingData, setListingData] = useState({
    askingPrice: '',
    description: '',
    transferMethod: 'electronic',
    paymentMethod: 'platform'
  });

  // Mock user's tickets that can be sold
  const userTickets = mockTickets;

  const handleInputChange = (field, value) => {
    setListingData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedTicketInfo = () => {
    return userTickets.find(ticket => ticket.id === selectedTicket);
  };

  const calculateFees = () => {
    const price = parseFloat(listingData.askingPrice) || 0;
    const platformFee = price * 0.1; // 10% platform fee
    const paymentFee = price * 0.03; // 3% payment processing fee
    const totalFees = platformFee + paymentFee;
    const netEarnings = price - totalFees;
    
    return {
      platformFee: platformFee.toFixed(2),
      paymentFee: paymentFee.toFixed(2),
      totalFees: totalFees.toFixed(2),
      netEarnings: Math.max(0, netEarnings).toFixed(2)
    };
  };

  const getSuggestedPrice = () => {
    const selectedTicketInfo = getSelectedTicketInfo();
    if (!selectedTicketInfo) return 0;
    
    // Mock AI price suggestion based on market demand
    const basePrice = selectedTicketInfo.price;
    const marketMultiplier = 1.15; // 15% above original price
    return Math.round(basePrice * marketMultiplier);
  };

  const handleListTicket = () => {
    if (!selectedTicket || !listingData.askingPrice) {
      toast({
        title: "Missing Information",
        description: "Please select a ticket and set an asking price.",
        variant: "destructive"
      });
      return;
    }

    const ticketInfo = getSelectedTicketInfo();
    const fees = calculateFees();

    // Mock listing creation
    toast({
      title: "Ticket Listed Successfully!",
      description: `Your ${ticketInfo.eventName} ticket is now live on the marketplace. You'll earn $${fees.netEarnings} if sold.`,
    });

    // Navigate back to marketplace or dashboard
    navigate('/marketplace');
  };

  const fees = calculateFees();
  const suggestedPrice = getSuggestedPrice();
  const selectedTicketInfo = getSelectedTicketInfo();

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
                onClick={() => navigate('/marketplace')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Button>
              <div className="flex items-center space-x-2">
                <Ticket className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">TicketAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Secure Listing</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sell Your Tickets</h1>
            <p className="text-slate-300">List your tickets on the marketplace and earn money from demand fluctuations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Listing Form */}
            <div className="space-y-6">
              {/* Ticket Selection */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Select Ticket to Sell</CardTitle>
                  <CardDescription className="text-slate-300">
                    Choose from your available tickets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select a ticket to sell" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {userTickets.map((ticket) => (
                        <SelectItem 
                          key={ticket.id} 
                          value={ticket.id}
                          className="text-white hover:bg-slate-600"
                        >
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <div className="font-medium">{ticket.eventName}</div>
                              <div className="text-sm text-slate-300">
                                {ticket.section} • {ticket.seat} • Original: ${ticket.price}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTicketInfo && (
                    <div className="p-4 bg-slate-700/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Event</span>
                        <span className="text-white font-medium">{selectedTicketInfo.eventName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date</span>
                        <span className="text-white">{new Date(selectedTicketInfo.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Section</span>
                        <span className="text-white">{selectedTicketInfo.section} • {selectedTicketInfo.seat}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Original Price</span>
                        <span className="text-white">${selectedTicketInfo.price}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Set Your Price
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {suggestedPrice > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span>AI Suggested Price: ${suggestedPrice}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white text-xs"
                          onClick={() => handleInputChange('askingPrice', suggestedPrice.toString())}
                        >
                          Use Suggestion
                        </Button>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="askingPrice" className="text-slate-200">Asking Price ($)</Label>
                    <Input
                      id="askingPrice"
                      type="number"
                      placeholder="Enter your asking price"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={listingData.askingPrice}
                      onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-200">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details about your tickets..."
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      value={listingData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transferMethod" className="text-slate-200">Transfer Method</Label>
                      <Select value={listingData.transferMethod} onValueChange={(value) => handleInputChange('transferMethod', value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="electronic" className="text-white hover:bg-slate-600">Electronic Transfer</SelectItem>
                          <SelectItem value="mobile" className="text-white hover:bg-slate-600">Mobile Wallet</SelectItem>
                          <SelectItem value="physical" className="text-white hover:bg-slate-600">Physical Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-slate-200">Payment Method</Label>
                      <Select value={listingData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="platform" className="text-white hover:bg-slate-600">Platform Escrow</SelectItem>
                          <SelectItem value="crypto" className="text-white hover:bg-slate-600">Cryptocurrency</SelectItem>
                          <SelectItem value="bank" className="text-white hover:bg-slate-600">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Fees */}
            <div className="space-y-6">
              {/* Fee Breakdown */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Fee Breakdown</CardTitle>
                  <CardDescription className="text-slate-300">
                    Transparent pricing with no hidden fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-300">
                      <span>Asking Price</span>
                      <span>${listingData.askingPrice || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Platform Fee (10%)</span>
                      <span>-${fees.platformFee}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Payment Processing (3%)</span>
                      <span>-${fees.paymentFee}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2">
                      <div className="flex justify-between text-white font-semibold text-lg">
                        <span>You'll Receive</span>
                        <span className="text-green-400">${fees.netEarnings}</span>
                      </div>
                    </div>
                  </div>

                  {listingData.askingPrice && selectedTicketInfo && (
                    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Original Purchase</span>
                          <span>${selectedTicketInfo.price}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Potential Profit</span>
                          <span className={parseFloat(fees.netEarnings) > selectedTicketInfo.price ? 'text-green-400' : 'text-red-400'}>
                            ${(parseFloat(fees.netEarnings) - selectedTicketInfo.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security & Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Secure escrow payment system</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Blockchain ticket verification</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Fraud protection guarantee</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">24/7 customer support</span>
                  </div>
                </CardContent>
              </Card>

              {/* List Button */}
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                onClick={handleListTicket}
                disabled={!selectedTicket || !listingData.askingPrice}
              >
                <Upload className="mr-2 h-5 w-5" />
                List Ticket for Sale
              </Button>

              <p className="text-xs text-slate-400 text-center">
                By listing your ticket, you agree to our Terms of Service and Seller Policy. 
                Your listing will be live immediately and can be purchased by verified buyers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellTicket;