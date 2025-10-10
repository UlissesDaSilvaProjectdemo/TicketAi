import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  X, Mail, Phone, CheckCircle, Sparkles, Users, TrendingUp,
  Calendar, BarChart3, Zap
} from 'lucide-react';

const ContactPopup = ({ isOpen, onClose, onSubmit, trigger = 'general' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    eventType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-close after successful submission
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          eventType: '',
          message: ''
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.phone) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call parent onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  // Success state
  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-900 border-slate-700 max-w-md w-full mx-auto animate-in zoom-in-95 duration-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">
                We've received your information and will be in touch within 24 hours to help grow your events.
              </p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-400 font-semibold text-sm mb-1">What's Next?</p>
              <p className="text-slate-300 text-sm">
                Our team will contact you to discuss your event promotion needs and show you how TicketAI CRM can increase your revenue.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-semibold text-sm mb-2">🚀 Instant Demo Access</p>
              <p className="text-slate-300 text-sm mb-3">
                Want to see the CRM in action right now? Start your free 30-day trial with full access.
              </p>
              <Button
                onClick={() => {
                  // Navigate to the Demo CRM page for trial signup
                  window.location.href = '/demo-crm';
                }}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                Start Free Trial →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <Badge className="bg-blue-600 text-white mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Free Event Promotion
            </Badge>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Let's Grow Your Events Together
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Get personalized support and promotion strategies to maximize your event attendance and revenue
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">Revenue Growth</h4>
              <p className="text-slate-400 text-xs">Avg 40% increase</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">More Attendees</h4>
              <p className="text-slate-400 text-xs">Better targeting</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">Analytics</h4>
              <p className="text-slate-400 text-xs">Data-driven insights</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-white">Company/Organization</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Company name"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-white flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="eventType" className="text-white flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                What type of events do you organize?
              </Label>
              <Input
                id="eventType"
                type="text"
                placeholder="e.g., Concerts, Conferences, Sports, Comedy Shows"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-white">Tell us about your goals</Label>
              <Textarea
                id="message"
                placeholder="What are your biggest challenges with event promotion? What would you like to achieve?"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-h-[80px]"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={!formData.email || !formData.phone || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Free Event Support
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-slate-500 text-xs text-center">
              By submitting, you agree to receive communications from TicketAI. We respect your privacy and won't spam you.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactPopup;