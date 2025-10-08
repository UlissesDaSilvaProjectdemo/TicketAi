import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Ticket, ArrowLeft, Mail, Phone, MapPin, Clock, MessageSquare, 
  Users, Building, Zap, Send, CheckCircle, ExternalLink
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ContactPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Mock form submission
    toast({
      title: "Message Sent Successfully!",
      description: "We'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      inquiryType: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-blue-500" />,
      title: "Email Us",
      description: "Get in touch via email",
      contact: "hello@ticketai.com",
      action: "mailto:hello@ticketai.com"
    },
    {
      icon: <Phone className="h-6 w-6 text-green-500" />,
      title: "Call Us",
      description: "Speak with our team directly",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      title: "Live Chat",
      description: "Chat with support instantly",
      contact: "Available 24/7",
      action: "#"
    },
    {
      icon: <MapPin className="h-6 w-6 text-amber-500" />,
      title: "Visit Us",
      description: "Our headquarters",
      contact: "San Francisco, CA",
      action: "https://maps.google.com"
    }
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM PST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM PST" },
    { day: "Sunday", hours: "Closed" }
  ];

  const supportCategories = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "General Support",
      description: "Account help, billing questions, technical issues"
    },
    {
      icon: <Building className="h-8 w-8 text-purple-500" />,
      title: "Enterprise Sales",
      description: "Custom solutions, API access, white-label options"
    },
    {
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      title: "Partnership",
      description: "Business partnerships, integrations, collaboration"
    }
  ];

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
            Get in Touch
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Have questions about TicketAI? Our team is here to help you make the most of event trading.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Send Us a Message</h2>
              <p className="text-slate-400">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-200">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="Enter your company name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiryType" className="text-slate-200">Inquiry Type</Label>
                <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select inquiry type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="general" className="text-white hover:bg-slate-700">General Support</SelectItem>
                    <SelectItem value="sales" className="text-white hover:bg-slate-700">Sales Inquiry</SelectItem>
                    <SelectItem value="enterprise" className="text-white hover:bg-slate-700">Enterprise Solution</SelectItem>
                    <SelectItem value="partnership" className="text-white hover:bg-slate-700">Partnership</SelectItem>
                    <SelectItem value="technical" className="text-white hover:bg-slate-700">Technical Issue</SelectItem>
                    <SelectItem value="billing" className="text-white hover:bg-slate-700">Billing Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-200">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help you..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 min-h-[150px]"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
              </div>

              <Button 
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>

              <p className="text-center text-sm text-slate-500">
                We typically respond within 24 hours during business days.
              </p>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Other Ways to Reach Us</h2>
              <div className="grid grid-cols-1 gap-6">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{method.title}</h3>
                          <p className="text-slate-400 text-sm mb-2">{method.description}</p>
                          <a 
                            href={method.action}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {method.contact}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300">{schedule.day}</span>
                    <span className="text-white font-medium">{schedule.hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support Categories */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">How Can We Help?</h3>
              <div className="space-y-4">
                {supportCategories.map((category, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-slate-900/30 rounded-lg border border-slate-800">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{category.title}</h4>
                      <p className="text-slate-400 text-sm">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Support */}
            <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-700/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-red-400" />
                  Emergency Support
                </h3>
                <p className="text-slate-300 mb-4">
                  For urgent issues affecting live events or trading, contact our emergency line.
                </p>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:+15551234567')}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Hotline
                </Button>
              </CardContent>
            </Card>

            {/* Indiegogo CTA */}
            <Card className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-pink-700/30">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Support Our Mission</h3>
                <p className="text-slate-300 mb-4">
                  Help us revolutionize the event industry by supporting our Indiegogo campaign.
                </p>
                <Button 
                  className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white w-full"
                  onClick={() => window.open('https://indiegogo.com', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Back Our Campaign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;