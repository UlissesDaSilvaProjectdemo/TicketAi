import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Zap, Shield, Users, ArrowRight, Ticket, DollarSign } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
      title: "AI-Powered Pricing",
      description: "Our AI analyzes demand patterns, artist popularity, and market trends to predict ticket value fluctuations in real-time."
    },
    {
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      title: "Instant Trading",
      description: "Buy and sell tickets instantly with dynamic pricing. Watch your investments grow as demand increases."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure Transactions",
      description: "Blockchain-verified tickets and secure payment processing ensure your investments are protected."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Community Insights",
      description: "Join a community of event investors and fans sharing insights and market predictions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">TicketAI</span>
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
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Stock Market</span>
              <br />
              for Live Events
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Invest in event tickets like stocks. Buy low, sell high, or attend the show. 
              Our AI predicts demand and pricing trends so you never miss the perfect opportunity.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 group"
              onClick={() => navigate('/auth')}
            >
              Start Trading Tickets
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
              onClick={() => navigate('/events')}
            >
              Explore Events
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-700">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-400">$2.4M+</div>
              <div className="text-slate-400">Total Trading Volume</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">94%</div>
              <div className="text-slate-400">AI Prediction Accuracy</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">15K+</div>
              <div className="text-slate-400">Active Traders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-white">How It Works</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced AI meets live entertainment to create the world's first ticket trading platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-slate-600">
          <CardContent className="text-center py-16 space-y-6">
            <h3 className="text-3xl font-bold text-white">Ready to Start Trading?</h3>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Join thousands of users who are already making money from event tickets. 
              Sign up today and get your first trade bonus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Create Account
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6"
                onClick={() => navigate('/events')}
              >
                View Live Market
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-semibold text-white">TicketAI</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 TicketAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;