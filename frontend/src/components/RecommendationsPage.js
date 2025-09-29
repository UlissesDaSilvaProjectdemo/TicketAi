import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Calendar, MapPin, DollarSign, Users, Sparkles, Brain, Wand2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecommendationsPage = () => {
  const [preferences, setPreferences] = useState('');
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async (e) => {
    e.preventDefault();
    
    if (!preferences.trim()) {
      setError('Please tell us what kind of events you like!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/recommendations`, {
        user_preferences: preferences,
        location: location || null
      });

      setRecommendations(response.data.recommendations || []);
      setAiExplanation(response.data.ai_explanation || '');
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const examplePreferences = [
    "I love music festivals and outdoor concerts",
    "Tech conferences and startup networking events",
    "Art galleries and cultural exhibitions",
    "Comedy shows and entertainment events",
    "Sports events and live games"
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="recommendations-page">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6" style={{fontFamily: 'Space Grotesk'}}>
            AI-Powered
            <span className="text-gradient block">Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Tell us what you love, and our AI will find the perfect events for you. 
            Get personalized suggestions based on your interests and preferences.
          </p>
        </div>
      </div>

      {/* Recommendation Form */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Wand2 className="w-6 h-6 mr-3 text-purple-600" />
            Get Your AI Recommendations
          </CardTitle>
          <CardDescription>
            Share your interests and let our AI find events you'll love
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleGetRecommendations} className="space-y-6" data-testid="recommendations-form">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What kind of events do you enjoy? <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={preferences}
                onChange={(e) => {
                  setPreferences(e.target.value);
                  setError('');
                }}
                placeholder="Tell us about your interests, hobbies, or the type of events you like to attend..."
                rows={4}
                className="form-input resize-none"
                data-testid="preferences-input"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 mr-2">Try:</span>
                {examplePreferences.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPreferences(example)}
                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                    data-testid={`example-preference-${index}`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                placeholder="e.g., New York, San Francisco, or leave blank for all locations"
                data-testid="location-input"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="recommendations-error">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-lg py-3"
              data-testid="get-recommendations-btn"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  AI is analyzing your preferences...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Explanation */}
      {aiExplanation && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2" data-testid="ai-explanation-title">
                  AI Analysis
                </h3>
                <p className="text-purple-800 leading-relaxed" data-testid="ai-explanation-text">
                  {aiExplanation}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Results */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="recommendations-title">
              Recommended Events for You
            </h2>
            <Badge className="badge-primary" data-testid="recommendations-count">
              {recommendations.length} recommendations
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((event) => (
              <Card 
                key={event.id} 
                className="event-card overflow-hidden hover:shadow-2xl transition-all duration-300"
                data-testid={`recommended-event-${event.id}`}
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="badge-primary" data-testid={`recommended-event-category-${event.id}`}>
                      {event.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-sm font-semibold text-gray-900">
                        ${event.price}
                      </span>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2" data-testid={`recommended-event-title-${event.id}`}>
                    {event.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2" data-testid={`recommended-event-description-${event.id}`}>
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                      <span data-testid={`recommended-event-date-${event.id}`}>
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
                      <span data-testid={`recommended-event-location-${event.id}`}>
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-indigo-600" />
                        <span data-testid={`recommended-event-tickets-${event.id}`}>
                          {event.available_tickets} tickets left
                        </span>
                      </div>
                      <div className="flex items-center font-semibold text-lg text-indigo-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span data-testid={`recommended-event-price-${event.id}`}>
                          {event.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Link to={`/events/${event.id}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full btn-secondary"
                        data-testid={`view-recommended-event-btn-${event.id}`}
                      >
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/book/${event.id}`} className="flex-1">
                      <Button 
                        className="w-full btn-primary"
                        disabled={event.available_tickets === 0}
                        data-testid={`book-recommended-event-btn-${event.id}`}
                      >
                        {event.available_tickets === 0 ? 'Sold Out' : 'Book Now'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="outline" className="btn-secondary" data-testid="view-all-events-btn">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* No Recommendations State */}
      {recommendations.length === 0 && !loading && aiExplanation && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No specific recommendations found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find events that perfectly match your preferences, but we have some great general events available.
            </p>
            <Link to="/">
              <Button className="btn-primary">
                Browse All Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationsPage;