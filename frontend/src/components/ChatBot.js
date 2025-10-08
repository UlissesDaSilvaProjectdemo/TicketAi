import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { 
  MessageCircle, X, Send, Bot, User, Sparkles, 
  Ticket, CreditCard, Search, HelpCircle, Star,
  Zap, Heart, Music, ShoppingCart
} from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting message
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: "👋 Hi there! I'm your TicketAI assistant! I'm here to help you discover amazing events and navigate our platform. What can I help you with today?",
          timestamp: new Date(),
          quickReplies: [
            { text: "How does AI search work?", icon: Sparkles },
            { text: "Find events near me", icon: Search },
            { text: "How to buy tickets?", icon: Ticket },
            { text: "About credits system", icon: CreditCard }
          ]
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const botResponses = {
    "how does ai search work": {
      content: "🤖 Our AI search is powered by GPT-5! Simply type what you're looking for in natural language like 'rock concerts this weekend' or 'comedy shows in NYC' and our AI will understand and find perfect matches for you!",
      quickReplies: [
        { text: "Try AI search now", icon: Zap },
        { text: "See example searches", icon: Star }
      ]
    },
    "find events near me": {
      content: "📍 To find events near you, you can:\n\n1. Use our AI search and mention your city\n2. Browse our Events page\n3. Try AI Recommendations with your location\n\nWould you like me to guide you to any of these?",
      quickReplies: [
        { text: "Go to Events page", icon: Ticket },
        { text: "Try AI Recommendations", icon: Sparkles }
      ]
    },
    "how to buy tickets": {
      content: "🎫 Buying tickets is easy!\n\n1. Search for events you like\n2. Click on an event to see details\n3. Select your tickets and checkout\n4. Access tickets in 'My Tickets' page\n\nYou can pay with cards or use credits for special features!",
      quickReplies: [
        { text: "View My Tickets", icon: Ticket },
        { text: "What are credits?", icon: CreditCard }
      ]
    },
    "about credits system": {
      content: "💳 Credits are our virtual currency!\n\n✨ Get credits by:\n• Purchasing credit packs\n• Promoter activities\n\n💰 Use credits for:\n• External merchandise purchases (1.5 credits)\n• Event boosts (promoters)\n• Premium features\n\nCheck your balance in the top-right corner!",
      quickReplies: [
        { text: "Buy merchandise", icon: ShoppingCart },
        { text: "Become a promoter", icon: Star }
      ]
    },
    "try ai search now": {
      content: "🚀 Let's try AI search! I'll take you to our search section where you can type something like:\n\n• 'Electronic music festivals'\n• 'Comedy shows this Friday'\n• 'Jazz concerts in downtown'\n\nThe AI will find exactly what you're looking for!",
      action: "navigate",
      target: "/"
    },
    "go to events page": {
      content: "📅 Taking you to our Events page where you can browse all available events!",
      action: "navigate",
      target: "/events"
    },
    "view my tickets": {
      content: "🎟️ Taking you to your ticket dashboard!",
      action: "navigate",
      target: "/my-tickets"
    },
    "buy merchandise": {
      content: "🛍️ Taking you to our Merchandise page with band merch from official stores, Etsy, and more!",
      action: "navigate",
      target: "/merchandise"
    },
    "become a promoter": {
      content: "🎤 Interested in promoting events? Great! You can create events, boost them, and earn from ticket sales.",
      action: "navigate",
      target: "/promoter-login"
    },
    "pricing": {
      content: "💰 Check out our pricing plans for different user types - from free users to professional event traders!",
      action: "navigate",
      target: "/pricing"
    }
  };

  const handleSendMessage = (message = null) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const response = getBotResponse(messageToSend.toLowerCase());
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        quickReplies: response.quickReplies,
        action: response.action,
        target: response.target
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Handle navigation if needed
      if (response.action === 'navigate' && response.target) {
        setTimeout(() => {
          window.location.href = response.target;
        }, 1000);
      }
    }, 1000 + Math.random() * 1000);
  };

  const getBotResponse = (message) => {
    // Check for exact matches first
    for (const [key, response] of Object.entries(botResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }

    // Keyword-based responses
    if (message.includes('help') || message.includes('support')) {
      return {
        content: "🤝 I'm here to help! You can:\n\n• Ask about our AI features\n• Get help finding events\n• Learn about credits and pricing\n• Navigate the platform\n\nWhat specific area do you need help with?",
        quickReplies: [
          { text: "AI features", icon: Sparkles },
          { text: "Finding events", icon: Search },
          { text: "Pricing info", icon: CreditCard },
          { text: "Account help", icon: User }
        ]
      };
    }

    if (message.includes('price') || message.includes('cost') || message.includes('payment')) {
      return botResponses["pricing"];
    }

    if (message.includes('event') || message.includes('concert') || message.includes('show')) {
      return botResponses["find events near me"];
    }

    if (message.includes('credit') || message.includes('money') || message.includes('balance')) {
      return botResponses["about credits system"];
    }

    if (message.includes('merch') || message.includes('store') || message.includes('buy') || message.includes('shop')) {
      return botResponses["buy merchandise"];
    }

    // Default response
    return {
      content: "🤔 I'm not sure about that specific question, but I can help you with:\n\n• Finding and booking events\n• Understanding our AI search\n• Credits and pricing\n• Navigation help\n\nTry asking me something else or use one of the quick options below!",
      quickReplies: [
        { text: "How does AI search work?", icon: Sparkles },
        { text: "Find events near me", icon: Search },
        { text: "About credits system", icon: CreditCard },
        { text: "General help", icon: HelpCircle }
      ]
    };
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply.text);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen ? (
        // Chat button
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl h-14 w-14 rounded-full p-0 animate-pulse"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      ) : (
        // Chat window
        <Card className="bg-slate-900 border-slate-700 shadow-2xl w-80 h-96 flex flex-col animate-slide-up">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">TicketAI Assistant</CardTitle>
                  <p className="text-xs text-blue-100">Always here to help!</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                    : 'bg-slate-800 text-slate-100 rounded-r-lg rounded-tl-lg'
                } p-3`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                  
                  {message.quickReplies && (
                    <div className="mt-3 space-y-1">
                      {message.quickReplies.map((reply, index) => {
                        const IconComponent = reply.icon;
                        return (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                            onClick={() => handleQuickReply(reply)}
                          >
                            <IconComponent className="w-3 h-3 mr-2" />
                            {reply.text}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-100 rounded-r-lg rounded-tl-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 px-3"
                onClick={() => handleSendMessage()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatBot;