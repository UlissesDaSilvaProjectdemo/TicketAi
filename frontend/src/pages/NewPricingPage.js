import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, CheckCircle, ArrowLeft, Zap, Shield, Users, BarChart3,
  Phone, Mail, Star, Code, TrendingUp, Globe
} from 'lucide-react';

const NewPricingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('credits');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  TicketAI
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-slate-300 hover:text-white"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ⚡ Pay-As-You-Go Pricing
          </h1>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Buy Credits, Use Anytime
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Prefer flexibility? Buy credits and pay only for what you use. Perfect for startups and businesses with fluctuating search volumes.
            </p>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">100</div>
                <div className="text-slate-400">Free Trial Searches</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">12</div>
                <div className="text-slate-400">Months Validity</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">0</div>
                <div className="text-slate-400">Monthly Commitment</div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-700 p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">Pricing Plans Coming Soon!</h3>
            <p className="text-xl text-slate-300 mb-8">
              We're finalizing our pricing structure to offer you the best value. For now, enjoy unlimited free searches while we're in beta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xl px-12 py-6"
                onClick={() => navigate('/events')}
              >
                <Star className="mr-2 h-5 w-5" />
                Start Free Search
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xl px-12 py-6"
                onClick={() => navigate('/contact')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Get Notified When Ready
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewPricingPage;