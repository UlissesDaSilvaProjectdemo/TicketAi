import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import ContactPopup from '../components/ContactPopup';
import { 
  BarChart3, Users, DollarSign, Calendar, TrendingUp, Zap, 
  CheckCircle, ArrowRight, Star, Clock, Shield, Sparkles,
  Play, Target, Award, Rocket, Timer, CreditCard
} from 'lucide-react';

const DemoCRM = () => {
  const navigate = useNavigate();
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Check trial status on component mount
  useEffect(() => {
    const trialData = localStorage.getItem('crmTrialData');
    if (trialData) {
      const { startDate, daysRemaining } = JSON.parse(trialData);
      const daysSinceStart = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceStart >= 30) {
        // Trial expired - show pricing modal
        setShowPricingModal(true);
      }
    }
  }, []);

  const startFreeTrial = () => {
    // Start 30-day free trial
    const trialData = {
      startDate: new Date().toISOString(),
      daysRemaining: 30,
      plan: 'free_trial'
    };
    
    localStorage.setItem('crmTrialData', JSON.stringify(trialData));
    
    // Create demo user
    const demoUser = {
      id: 'test-promoter-1',
      email: 'demo@ticketai.com',
      name: 'Demo User',
      credits: 42,
      company: 'TicketAI Demo',
      trialStatus: 'active',
      trialDaysRemaining: 30
    };
    
    localStorage.setItem('promoterUser', JSON.stringify(demoUser));
    
    // Navigate to CRM
    navigate('/promoter-crm');
  };

  const handleContactSubmit = (formData) => {
    console.log('Lead captured:', formData);
    // Store lead data but don't block access
  };

  const handleUpgrade = (plan) => {
    // Handle subscription upgrade
    console.log('Upgrading to plan:', plan);
    setShowPricingModal(false);
    
    // Update user data with new plan
    const userData = JSON.parse(localStorage.getItem('promoterUser') || '{}');
    userData.plan = plan;
    userData.trialStatus = 'subscribed';
    localStorage.setItem('promoterUser', JSON.stringify(userData));
    
    navigate('/promoter-crm');
  };

  const features = [
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time revenue, ticket sales, and audience insights" },
    { icon: Users, title: "Audience Management", desc: "Contact segmentation and engagement tracking" },
    { icon: DollarSign, title: "Revenue Optimization", desc: "Multiple revenue streams and automated payouts" },
    { icon: Calendar, title: "Event Management", desc: "Complete event lifecycle management and performance tracking" },
    { icon: Target, title: "Marketing Campaigns", desc: "Email marketing, automation, and campaign analytics" },
    { icon: TrendingUp, title: "Growth Analytics", desc: "AI-powered insights and recommendation engine" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Elite Events",
      feedback: "TicketAI CRM increased our ticket sales by 65% in just 3 months. The audience insights are game-changing!",
      revenue: "+$120K"
    },
    {
      name: "Michael Chen",  
      company: "Music Collective",
      feedback: "The marketing automation saved us 20 hours per week. ROI was immediate.",
      revenue: "+$85K"
    },
    {
      name: "Emma Davis",
      company: "Corporate Events Plus",
      feedback: "Finally, a CRM built specifically for event promoters. The streaming integration is brilliant.",
      revenue: "+$200K"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg px-6 py-2">
              <Timer className="w-4 h-4 mr-2" />
              30-Day Free Trial • No Credit Card Required
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              TicketAI{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CRM Demo
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              The complete event promotion platform trusted by 2,500+ promoters. 
              Manage events, grow audiences, and maximize revenue with AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Button 
                size="lg"
                onClick={startFreeTrial}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-12 py-8 font-semibold"
              >
                <Rocket className="w-6 h-6 mr-3" />
                Start Free 30-Day Trial
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setShowContactPopup(true)}
                className="border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white text-xl px-12 py-8"
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Demo Video
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 mt-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Full Feature Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Everything You Need to Grow Events</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            From analytics to automation, manage your entire event business in one powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-600 hover:border-blue-500/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-slate-900/30 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Trusted by Top Event Promoters</h2>
            <p className="text-xl text-slate-400">
              Join thousands of promoters who've grown their revenue with TicketAI CRM
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Badge className="ml-auto bg-green-600 text-white">
                      {testimonial.revenue}
                    </Badge>
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.feedback}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-3xl p-12 text-center">
          <Badge className="bg-green-600 text-white mb-6">
            <Sparkles className="w-4 h-4 mr-1" />
            Limited Time Offer
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Growing Your Events Today
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join 2,500+ successful promoters. Get full access to TicketAI CRM with our 30-day free trial.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={startFreeTrial}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-xl px-12 py-8"
            >
              <Timer className="w-6 h-6 mr-3" />
              Claim Your Free Trial
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/promoters-venues')}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-xl px-12 py-8"
            >
              Learn More
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>

          <p className="text-slate-500 text-sm mt-6">
            30-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Contact Popup - Non-blocking */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onSubmit={handleContactSubmit}
        trigger="demo_crm_page"
      />

      {/* Pricing Modal - Shows after trial expiry */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-4xl w-full mx-auto animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Your Free Trial Has Ended
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Continue growing your events with a paid subscription
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <Card className="border-slate-600 relative">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Starter</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $29<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Up to 5 events/month</div>
                    <div className="text-slate-300 text-sm">✓ 1,000 contacts</div>
                    <div className="text-slate-300 text-sm">✓ Basic analytics</div>
                    <div className="text-slate-300 text-sm">✓ Email support</div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleUpgrade('starter')}
                    >
                      Select Starter
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="border-blue-500 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Most Popular
                  </Badge>
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Pro</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $79<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Unlimited events</div>
                    <div className="text-slate-300 text-sm">✓ 10,000 contacts</div>
                    <div className="text-slate-300 text-sm">✓ Advanced analytics</div>
                    <div className="text-slate-300 text-sm">✓ Marketing automation</div>
                    <div className="text-slate-300 text-sm">✓ Priority support</div>
                    <Button 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUpgrade('pro')}
                    >
                      Select Pro
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="border-slate-600 relative">
                  <CardHeader className="text-center">
                    <CardTitle className="text-white">Enterprise</CardTitle>
                    <div className="text-3xl font-bold text-white">
                      $199<span className="text-lg text-slate-400">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-slate-300 text-sm">✓ Everything in Pro</div>
                    <div className="text-slate-300 text-sm">✓ Unlimited contacts</div>
                    <div className="text-slate-300 text-sm">✓ White-label options</div>
                    <div className="text-slate-300 text-sm">✓ API access</div>
                    <div className="text-slate-300 text-sm">✓ Dedicated support</div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleUpgrade('enterprise')}
                    >
                      Select Enterprise
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button 
                  variant="ghost"
                  onClick={() => setShowPricingModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Continue with Limited Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DemoCRM;