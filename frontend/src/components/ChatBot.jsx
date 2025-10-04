import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MessageCircle, X, Send, Bot, User, Search, Star, CreditCard, HelpCircle } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 Looking for events or need help?",
      isBot: true,
      timestamp: new Date(),
      showQuickActions: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user, setShowAuth } = useContext(AuthContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      id: 'find_events',
      text: 'Find Events',
      icon: Search,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'get_recommendations',
      text: 'Get Recommendations',
      icon: Star,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'buy_tickets',
      text: 'Buy Tickets',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'help',
      text: 'Help & Support',
      icon: HelpCircle,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const responses = {
    // Event finding responses
    find_events: "🎯 **Find Amazing Events**\n\nI can help you discover events in several ways:\n\n🔍 **Smart Search**: Use our AI-powered search on the homepage - just type what you're looking for like \"rock concerts this weekend\" or \"comedy shows under $50\"\n\n📍 **Browse by Location**: Tell me your city and I'll show you local events\n\n🎭 **Browse Categories**: Music, Comedy, Sports, Theater, Festivals\n\nWhat type of events are you interested in?",
    
    get_recommendations: user ? 
      `🌟 **Personalized Recommendations**\n\nHi ${user.name}! I can create AI-powered recommendations just for you based on:\n\n• Your search history\n• Previous ticket purchases\n• Your preferences\n• Popular events in your area\n\n**Ready to get started?**\n- Click "Get AI Recommendations" on the homepage\n- Or visit the Recommendations page directly\n\nEach recommendation request uses 1 credit. You currently have ${user.credits || 0} credits available.` :
      "🌟 **Get Personalized Recommendations**\n\nOur AI creates personalized event suggestions based on your preferences! To get started:\n\n1. **Sign up or login** (it's free!)\n2. Get 100 free trial credits\n3. Tell us your preferences\n4. Receive AI-powered recommendations\n\n**Benefits:**\n• Discover events you'll love\n• Skip the endless scrolling\n• Find hidden gems in your area\n\nReady to create your account?",

    buy_tickets: "🎫 **Buy Tickets Easily**\n\nHere's how to purchase tickets on TicketAI:\n\n**1. Find Your Event**\n• Browse our events page\n• Use AI search to find specific events\n• Get personalized recommendations\n\n**2. Select & Purchase**\n• Click on any event for details\n• Choose your ticket type\n• Secure checkout with Stripe\n\n**3. Get Your Tickets**\n• Instant email confirmation\n• QR codes for entry\n• Mobile-friendly tickets\n\n**Need help with a specific event?** Tell me what you're looking for!",

    help: "❓ **Help & Support**\n\n**Common Questions:**\n\n💳 **Credits & Pricing**\n• How do credits work?\n• What are the pricing plans?\n• Free trial information\n\n🎫 **Tickets & Events**\n• How to buy tickets?\n• Refund policies\n• Event details\n\n🤖 **AI Features**\n• Smart search tips\n• Recommendation system\n• Account management\n\n**Need More Help?**\n• Email: support@ticketai.com\n• Live chat (you're here!)\n• FAQ section\n\nWhat can I help you with specifically?",

    // Specific responses
    credits: user ?
      `💳 **Your Credits**\n\nHi ${user.name}! Here's your credit information:\n\n**Current Balance:** ${user.credits || 0} credits\n**Trial Status:** ${user.free_trial_used ? 'Used' : 'Available'}\n\n**How Credits Work:**\n• 1 credit = 1 AI search or recommendation\n• Credits never expire (12 months validity)\n• Purchase more anytime on our pricing page\n\n**Need More Credits?**\nVisit our pricing page for great deals starting at just $1 for 5 credits!` :
      "💳 **Credits System**\n\n**How It Works:**\n• 1 credit = 1 AI-powered search\n• New users get 100 free credits!\n• Credits valid for 12 months\n• No monthly commitment\n\n**Pricing:**\n• Quick Top-up: $1 for 5 credits\n• Starter Pack: $9.99 for 100 credits\n• Value Pack: $50 for 250 credits\n• And more great options!\n\nSign up now to get your 100 free credits!",

    search_help: "🔍 **Smart Search Tips**\n\n**Natural Language Search:**\n✅ \"Rock concerts this weekend in NYC\"\n✅ \"Comedy shows under $30\"\n✅ \"Family-friendly events near me\"\n✅ \"Jazz festivals in summer\"\n\n**Search Features:**\n• Location-based results\n• Price filtering\n• Date range selection\n• Category browsing\n\n**Pro Tips:**\n• Be specific about dates and location\n• Use price ranges (\"under $50\")\n• Try different keywords\n• Ask for recommendations if search is broad\n\nReady to try our AI search?",

    account: user ?
      `👤 **Your Account**\n\nHi ${user.name}!\n\n**Account Details:**\n• Email: ${user.email}\n• Credits: ${user.credits || 0}\n• Member since: ${new Date(user.created_at).toLocaleDateString()}\n\n**Quick Actions:**\n• View purchase history\n• Update preferences\n• Manage notifications\n• Buy more credits\n\n**Need to update something?**\nVisit your dashboard or let me know how I can help!` :
      "👤 **Account Information**\n\n**Create Your Free Account:**\n• 100 free trial credits\n• Personalized recommendations\n• Purchase history\n• Saved preferences\n\n**Account Benefits:**\n• Track your searches\n• Get better recommendations\n• Faster checkout\n• Credit balance tracking\n\n**Ready to sign up?** It only takes 30 seconds!",

    pricing: "💰 **Flexible Pricing Options**\n\n**Pay-As-You-Go Credits:**\n🔥 Quick Top-up: $1 → 5 searches\n⭐ Starter Pack: $9.99 → 100 searches\n💎 Value Pack: $50 → 250 searches (Popular!)\n🚀 Premium Pack: $100 → 500 searches\n🏢 Business: $500 → 3,000 searches (+20% bonus)\n🌟 Enterprise: $1,000 → 6,000 searches (+20% bonus)\n\n**Monthly Subscriptions:**\n• Basic: $50/month (unlimited)\n• Pro: $300/month (unlimited + premium)\n• Enterprise: Custom pricing\n\n**All plans include:**\n• AI-powered search\n• Personalized recommendations\n• 12-month credit validity\n• Email support\n\nWant to see detailed pricing? Visit our pricing page!"
  };

  const getBotResponse = (userMessage, actionId = null) => {
    if (actionId) {
      return responses[actionId] || responses.help;
    }

    const message = userMessage.toLowerCase();
    
    // Event finding keywords
    if (message.includes('find') || message.includes('search') || message.includes('event') || message.includes('look')) {
      if (message.includes('how') || message.includes('help')) {
        return responses.search_help;
      }
      return responses.find_events;
    }
    
    // Recommendations keywords  
    else if (message.includes('recommend') || message.includes('suggest') || message.includes('ai')) {
      return responses.get_recommendations;
    }
    
    // Ticket purchasing keywords
    else if (message.includes('buy') || message.includes('ticket') || message.includes('purchase') || message.includes('book')) {
      return responses.buy_tickets;
    }
    
    // Credits and pricing
    else if (message.includes('credit') || message.includes('price') || message.includes('cost') || message.includes('pay')) {
      if (message.includes('credit') && !message.includes('price')) {
        return responses.credits;
      }
      return responses.pricing;
    }
    
    // Account related
    else if (message.includes('account') || message.includes('profile') || message.includes('login') || message.includes('signup')) {
      return responses.account;
    }
    
    // Help and greetings
    else if (message.includes('help') || message.includes('support') || message.includes('question')) {
      return responses.help;
    }
    
    // Greetings
    else if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return "Hello! 👋 Welcome to TicketAI! I'm here to help you discover amazing events.\n\nI can assist you with:\n🔍 **Finding Events** - Smart search and browsing\n⭐ **Recommendations** - AI-powered suggestions\n🎫 **Buying Tickets** - Easy and secure\n💳 **Credits & Pricing** - Plans and payments\n\nWhat would you like to do today?";
    }
    
    // Default response
    else {
      return "I'm here to help you with TicketAI! 🎭\n\nI can help you:\n\n🔍 **Find Events** - Discover concerts, shows, festivals\n⭐ **Get Recommendations** - AI-powered suggestions\n🎫 **Buy Tickets** - Secure and easy checkout\n💳 **Credits & Pricing** - Payment plans\n❓ **General Support** - Any questions\n\nWhat would you like to know more about?";
    }
  };

  const handleQuickAction = (actionId) => {
    const actionText = quickActions.find(a => a.id === actionId)?.text || actionId;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: actionText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Handle navigation actions
    setTimeout(() => {
      let botResponse = getBotResponse('', actionId);
      
      // Add navigation hints based on action
      if (actionId === 'find_events') {
        botResponse += "\n\n**Quick Actions:**\n• Browse events on homepage\n• Try AI search above\n• Visit specific categories";
      } else if (actionId === 'get_recommendations') {
        if (user) {
          botResponse += "\n\n**Ready to get recommendations?** I can take you there now!";
        } else {
          botResponse += "\n\n**Want to sign up?** I can help you get started!";
        }
      }

      const response = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
        showActions: actionId === 'get_recommendations' || actionId === 'find_events'
      };
      
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(messageToProcess),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNavigation = (action) => {
    if (action === 'recommendations') {
      if (user) {
        navigate('/recommendations');
        setIsOpen(false);
      } else {
        setShowAuth(true);
      }
    } else if (action === 'events') {
      navigate('/');
      setIsOpen(false);
    } else if (action === 'signup') {
      setShowAuth(true);
    } else if (action === 'pricing') {
      navigate('/pricing');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            data-testid="main-chat-button"
          >
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </Button>
          {/* Subtle animation ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-400/30 animate-pulse"></div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold">TicketAI Assistant</span>
                <div className="text-xs text-indigo-100">Here to help you find events!</div>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-start space-x-2 max-w-xs ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                        : 'bg-gray-300'
                    }`}>
                      {message.isBot ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg shadow-sm ${
                        message.isBot
                          ? 'bg-white text-gray-800 border border-gray-200'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line leading-relaxed">{message.text}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions for first message */}
                {message.showQuickActions && (
                  <div className="grid grid-cols-2 gap-2 ml-9">
                    {quickActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          variant="outline"
                          size="sm"
                          className={`h-auto py-2 px-3 text-xs bg-gradient-to-r ${action.color} text-white border-none hover:opacity-90 transition-all duration-200`}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {action.text}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Action buttons for specific responses */}
                {message.showActions && (
                  <div className="flex flex-wrap gap-2 ml-9">
                    {message.text.includes('recommendations') && (
                      <Button
                        onClick={() => handleNavigation('recommendations')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Get Recommendations
                      </Button>
                    )}
                    {message.text.includes('search') && (
                      <Button
                        onClick={() => handleNavigation('events')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Search className="w-3 h-3 mr-1" />
                        Browse Events
                      </Button>
                    )}
                    {!user && (
                      <Button
                        onClick={() => handleNavigation('signup')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Sign Up Free
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {['Find events', 'Get recommendations', 'How it works', 'Pricing'].map((suggestion) => (
                <Button
                  key={suggestion}
                  onClick={() => {
                    setInputMessage(suggestion);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-gray-600 hover:text-indigo-600"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;