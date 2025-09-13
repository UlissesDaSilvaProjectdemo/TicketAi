import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Ticket, CheckCircle, Download, Share2, Calendar, MapPin, QrCode, 
  ArrowRight, Mail, Smartphone 
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    // Get ticket data from localStorage
    const data = localStorage.getItem('purchaseSuccess');
    if (data) {
      setTicketData(JSON.parse(data));
    } else {
      navigate('/events');
    }
  }, [navigate]);

  const handleDownloadTicket = () => {
    toast({
      title: "Ticket Downloaded",
      description: "Your digital ticket has been saved to your device.",
    });
  };

  const handleShareTicket = () => {
    toast({
      title: "Share Link Copied",
      description: "Ticket sharing link copied to clipboard.",
    });
  };

  const handleAddToWallet = () => {
    toast({
      title: "Added to Wallet",
      description: "Ticket has been added to your mobile wallet.",
    });
  };

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                onClick={() => navigate('/dashboard/fan')}
              >
                View Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/events')}
              >
                Browse More Events
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/20 p-6">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Purchase Successful!</h1>
            <p className="text-xl text-slate-300">
              Your tickets have been secured and are ready to use
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleDownloadTicket}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Tickets
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={handleAddToWallet}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Add to Wallet
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={handleShareTicket}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Digital Ticket */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl">{ticketData.eventName}</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  Digital Ticket - {ticketData.ticketType}
                </CardDescription>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Ticket Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Ticket Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Ticket className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">Ticket ID</div>
                        <div className="text-slate-300 text-sm font-mono">{ticketData.ticketId}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Purchase Date</div>
                        <div className="text-slate-300 text-sm">{formatDate(ticketData.purchaseDate)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Section</div>
                        <div className="text-slate-300 text-sm">{ticketData.ticketType}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-300">Total Paid ({ticketData.quantity} tickets)</span>
                    <span className="text-white font-bold">${ticketData.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-6 rounded-lg">
                  <QrCode className="h-32 w-32 text-black" />
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">QR Code</div>
                  <div className="text-slate-400 text-sm">Scan at venue entrance</div>
                  <div className="text-slate-400 text-xs font-mono mt-1">{ticketData.qrCode}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">What's Next?</CardTitle>
            <CardDescription className="text-slate-300">
              Important information about your tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">Email Confirmation</div>
                    <div className="text-slate-300 text-sm">
                      A confirmation email has been sent to {ticketData.customerEmail}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-green-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">Mobile Access</div>
                    <div className="text-slate-300 text-sm">
                      Add to your mobile wallet for easy access at the venue
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">Venue Entry</div>
                    <div className="text-slate-300 text-sm">
                      Show your QR code at the venue entrance. Arrive 30 minutes early.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Share2 className="h-5 w-5 text-amber-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">Ticket Transfer</div>
                    <div className="text-slate-300 text-sm">
                      You can transfer tickets through your dashboard if needed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-600">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 flex-1"
                onClick={() => navigate('/dashboard/fan')}
              >
                View My Tickets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 flex-1"
                onClick={() => navigate('/events')}
              >
                Browse More Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;