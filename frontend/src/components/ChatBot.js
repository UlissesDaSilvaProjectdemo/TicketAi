import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your TicketAI assistant. How can I help you with our pricing plans?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = {
    // Pricing questions
    pricing: "We offer flexible pricing options:\n\n💳 **Pay-As-You-Go Credits:**\n- Quick Top-up: $1 for 5 searches\n- Basic Pack: $20 for 100 searches\n- Value Pack: $50 for 250 searches (Most Popular!)\n- Premium Pack: $100 for 500 searches\n- Business Bundle: $500 for 3,000 searches (20% bonus!)\n- Enterprise Bundle: $1,000 for 6,000 searches (20% bonus!)\n\n📅 **Subscription Plans:**\n- Basic: $50/month (unlimited searches)\n- Pro: $300/month (unlimited searches + premium features)\n- Enterprise: Custom pricing",
    
    credits: "Credits are our flexible payment system:\n\n✅ **How it works:**\n- 1 credit = 1 AI-powered search\n- Credits never expire for 12 months\n- Buy only what you need\n- Perfect for occasional users\n\n🎁 **Best Value:**\n- Business & Enterprise bundles include 20% bonus credits\n- Value Pack ($50) is most popular for regular users",
    
    subscription: "Our subscription plans offer unlimited searches:\n\n🔵 **Basic ($50/month):**\n- Unlimited AI searches\n- Advanced filtering\n- Priority email support\n- API access\n\n🟣 **Pro ($300/month):**\n- Everything in Basic\n- Phone support\n- Advanced analytics\n- Custom integrations\n- Dedicated account manager\n\n🟢 **Enterprise (Custom):**\n- White-label options\n- Custom integrations\n- On-premise deployment\n- SLA guarantees",
    
    difference: "**Credits vs Subscriptions:**\n\n💳 **Credits (Pay-as-you-go):**\n- Perfect for: Occasional users, testing, flexible usage\n- Pay only for what you use\n- No monthly commitment\n- Credits valid for 12 months\n\n📅 **Subscriptions:**\n- Perfect for: Regular users, businesses, consistent usage\n- Unlimited searches per month\n- Priority support\n- Advanced features included\n- Predictable monthly cost",
    
    trial: "🆓 **Free Trial Options:**\n\n1. **Starter Pack** ($9.99 for 100 searches)\n   - Best for testing our service\n   - Full feature access\n   \n2. **Quick Top-up** ($1 for 5 searches)\n   - Perfect for quick testing\n   - Instant activation\n\nBoth give you full access to our AI-powered event search and recommendations!",
    
    ai: "🤖 **Our AI Features:**\n\n🔍 **Smart Search:**\n- Natural language queries (\"rock concerts this weekend\")\n- Location-based results\n- Price and date filtering\n\n💡 **Personalized Recommendations:**\n- Based on your search history\n- Tailored to your preferences\n- Local venues + TicketMaster integration\n\n📊 **Usage:**\n- 1 credit per AI search\n- 1 credit per recommendation request\n- Real-time results and analysis"
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('pricing') || message.includes('cost') || message.includes('price')) {
      return predefinedResponses.pricing;
    } else if (message.includes('credit') && (message.includes('subscription') || message.includes('plan'))) {
      return predefinedResponses.difference;
    } else if (message.includes('credit')) {
      return predefinedResponses.credits;
    } else if (message.includes('subscription') || message.includes('plan') || message.includes('monthly')) {
      return predefinedResponses.subscription;
    } else if (message.includes('trial') || message.includes('free') || message.includes('test')) {
      return predefinedResponses.trial;
    } else if (message.includes('ai') || message.includes('search') || message.includes('recommendation')) {
      return predefinedResponses.ai;
    } else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help you understand our pricing options. You can ask me about:\n\n• Credit packs vs subscriptions\n• Free trial options\n• AI features\n• Best value packages\n\nWhat would you like to know?";
    } else if (message.includes('help')) {
      return "I can help you with:\n\n💰 **Pricing questions**\n💳 **Credit system**\n📅 **Subscription plans**\n🆓 **Free trials**\n🤖 **AI features**\n\nJust ask me anything about our pricing!";
    } else {
      return "I'm here to help with pricing questions! You can ask me about:\n\n• \"What are your pricing options?\"\n• \"Credits vs subscriptions?\"\n• \"Free trial options?\"\n• \"Best value packages?\"\n• \"How does the AI work?\"\n\nWhat would you like to know?";
    }
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What are your pricing options?",
    "Credits vs subscriptions?",
    "Free trial options?",
    "Best value packages?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send after a short delay
    setTimeout(() => {
      const userMessage = {
        id: Date.now(),
        text: question,
        isBot: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: getBotResponse(question),
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    }, 100);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-50"
          data-testid="chat-button"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">TicketAI Assistant</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.isBot 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                      : 'bg-gray-300'
                  }`}>
                    {message.isBot ? (
                      <Bot className="w-3 h-3 text-white" />
                    ) : (
                      <User className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
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

          {/* Quick Questions (show only initially) */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
              <div className="space-y-1">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-auto py-1 px-2"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about pricing..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;