import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Calendar, MapPin, Brain } from 'lucide-react';

const AIAnalysisDemo = () => {
  // Mock events data that would come from search results
  const mockEvents = [
    {
      id: 'art-gallery-1',
      name: 'Art Gallery Opening',
      location: 'New York, NY',
      date: '2025-10-15T19:00:00Z',
      price: 75.00,
      description: 'Join the exclusive opening of a contemporary art exhibition featuring emerging artists. This event includes wine and networking opportunities, making it perfect for art enthusiasts like yourself.',
      source: 'local',
      available_tickets: 25
    },
    {
      id: 'broadway-hamilton',
      name: 'Broadway: Hamilton',
      location: 'Richard Rodgers Theatre, New York, NY',
      date: '2025-10-20T20:00:00Z',
      price: 189.99,
      description: 'Experience the revolutionary musical that has captivated audiences worldwide. "Hamilton" tells the story of America\'s founding father Alexander Hamilton and offers a unique blend of history and culture, aligned with your interests in the arts.',
      source: 'ticketmaster',
      external_url: 'https://www.ticketmaster.com/hamilton',
      available_tickets: 50
    },
    {
      id: 'summer-music-fest',
      name: 'Summer Music Festival',
      location: 'Austin, TX',
      date: '2025-10-25T14:00:00Z',
      price: 199.99,
      description: 'This three-day outdoor music festival features top artists from multiple genres. While it leans towards music, the festival atmosphere often includes art installations and cultural experiences, appealing to your appreciation for the arts.',
      source: 'local',
      available_tickets: 100
    },
    {
      id: 'taylor-swift-eras',
      name: 'Taylor Swift | The Eras Tour',
      location: 'MetLife Stadium, East Rutherford, NJ',
      date: '2025-11-01T20:00:00Z',
      price: 299.99,
      description: 'This spectacular concert showcases Taylor Swift\'s biggest hits spanning her entire career. Engaging with live music and theatrical performances can resonate with your love for cultural events.',
      source: 'ticketmaster',
      external_url: 'https://www.ticketmaster.com/taylor-swift',
      available_tickets: 200
    },
    {
      id: 'tech-conference-2025',
      name: 'Tech Conference 2025',
      location: 'San Francisco, CA',
      date: '2025-11-05T09:00:00Z',
      price: 299.99,
      description: 'While primarily focused on technology, this conference may feature creative applications and cultural impacts of art and technology. It\'s a unique opportunity to explore art in a modern context, though it\'s less centered on traditional art exhibitions.',
      source: 'local',
      available_tickets: 75
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Search Results Demo</h1>
      
      {/* AI Analysis Section with Buy Buttons */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-8">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-4" data-testid="ai-analysis-title">
                Recommended Events for You
              </h3>
              
              {/* Enhanced AI Analysis with Buy Buttons */}
              <div className="space-y-4">
                {mockEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="bg-white/60 rounded-lg p-4 border border-purple-200 hover:bg-white/80 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 text-lg" data-testid={`ai-rec-title-${event.id}`}>
                          {event.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-purple-700 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mb-2">
                          ${event.price}
                        </div>
                        <p className="text-purple-800 text-sm leading-relaxed" data-testid={`ai-rec-desc-${event.id}`}>
                          {event.description}
                        </p>
                      </div>
                      
                      {/* Buy Ticket Button */}
                      <div className="ml-4 flex-shrink-0">
                        {event.source === 'ticketmaster' ? (
                          <Button
                            onClick={() => window.open(event.external_url || `https://www.ticketmaster.com`, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                            data-testid={`ai-buy-tm-${event.id}`}
                          >
                            Buy on TicketMaster
                          </Button>
                        ) : (
                          <Link to={`/book/${event.id}`}>
                            <Button 
                              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                              disabled={event.available_tickets === 0}
                              data-testid={`ai-buy-local-${event.id}`}
                            >
                              {event.available_tickets === 0 ? 'Sold Out' : 'Buy Ticket'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                <p className="text-purple-800 text-sm">
                  ✅ <strong>Enhancement Complete:</strong> Each recommended event now includes a prominent "Buy Ticket" button for immediate purchase action. 
                  TicketMaster events redirect to external site, while local events use the integrated credit system with 5 credits per booking.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisDemo;