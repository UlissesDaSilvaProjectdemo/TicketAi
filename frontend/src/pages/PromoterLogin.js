import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Ticket, Mail, Lock, User, ArrowLeft, Building, Phone, MapPin
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const PromoterLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: 'testpromoter@demo.com',
    password: 'demo123'
  });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    address: ''
  });

  const handleLoginInputChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSignupInputChange = (field, value) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login validation
    if (loginForm.email === 'testpromoter@demo.com' && loginForm.password === 'demo123') {
      const userData = {
        id: 'test-promoter-1', // This matches our seeded CRM data
        name: 'Test Promoter',
        email: 'testpromoter@demo.com',
        company: 'Demo Events LLC',
        credits: 42,
        joinDate: '2024-01-15',
        phone: '+1 (555) 123-4567',
        address: 'San Francisco, CA'
      };

      localStorage.setItem('promoterUser', JSON.stringify(userData));
      
      toast({
        title: "Login Successful!",
        description: "Welcome to your CRM dashboard with real event data!",
      });
      
      navigate('/promoter-crm');
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Please use demo credentials: testpromoter@demo.com / demo123",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Mock signup - create new promoter account
    const userData = {
      id: `promoter_${Date.now()}`,
      name: signupForm.name,
      email: signupForm.email,
      company: signupForm.company || 'Independent Promoter',
      credits: 10, // Welcome credits
      joinDate: new Date().toISOString(),
      phone: signupForm.phone,
      address: signupForm.address
    };

    localStorage.setItem('promoterUser', JSON.stringify(userData));
    
    toast({
      title: "Account Created!",
      description: `Welcome ${signupForm.name}! You've received 10 welcome credits.`,
    });
    
    navigate('/promoter-crm');
    setIsLoading(false);
  };

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
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Building className="h-8 w-8 text-purple-500" />
              <span className="text-2xl font-bold text-white">Promoter Portal</span>
            </div>
            <p className="text-slate-300">Access your event management dashboard</p>
          </div>

          {/* Auth Tabs */}
          <Card className="bg-slate-900/50 border-slate-700">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="signin" className="data-[state=active]:bg-slate-700">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-slate-700">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <CardHeader>
                  <CardTitle className="text-white">Promoter Sign In</CardTitle>
                  <CardDescription className="text-slate-300">
                    Access your event dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-slate-200">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={loginForm.email}
                          onChange={(e) => handleLoginInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-slate-200">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={loginForm.password}
                          onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
                    </Button>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm mb-2">Demo Credentials:</p>
                      <p className="text-slate-300 text-sm">Email: testpromoter@demo.com</p>
                      <p className="text-slate-300 text-sm">Password: demo123</p>
                    </div>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle className="text-white">Create Promoter Account</CardTitle>
                  <CardDescription className="text-slate-300">
                    Join thousands of event promoters using TicketAI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-slate-200">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your name"
                            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                            value={signupForm.name}
                            onChange={(e) => handleSignupInputChange('name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-slate-200">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                            value={signupForm.email}
                            onChange={(e) => handleSignupInputChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-slate-200">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={signupForm.password}
                          onChange={(e) => handleSignupInputChange('password', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company" className="text-slate-200">Company</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signup-company"
                          type="text"
                          placeholder="Your company name"
                          className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                          value={signupForm.company}
                          onChange={(e) => handleSignupInputChange('company', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="text-slate-200">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                            value={signupForm.phone}
                            onChange={(e) => handleSignupInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-address" className="text-slate-200">City</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="signup-address"
                            type="text"
                            placeholder="City, State"
                            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                            value={signupForm.address}
                            onChange={(e) => handleSignupInputChange('address', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account + 10 Welcome Credits'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="text-center">
            <p className="text-slate-500 text-sm">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoterLogin;