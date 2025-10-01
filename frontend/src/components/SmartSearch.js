import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Search, Sparkles, MapPin, Calendar, Filter, Loader2, 
  Clock, TrendingUp, Star, Mic, MicOff, Brain 
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SmartSearch = ({ onResults, isMainSearch = false }) => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const categories = [
    'All', 'Music', 'Sports', 'Technology', 'Arts', 'Business', 'Comedy', 'Theater'
  ];

  const smartSearchExamples = [
    "Find rock concerts this weekend in New York",
    "Tech conferences next month under $200", 
    "Free outdoor events near me",
    "Art galleries opening this week",
    "Sports games for families with kids",
    "Comedy shows tonight downtown",
    "Music festivals in California this summer",
    "Business networking events next week"
  ];

  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Under $50', value: 'under-50' },
    { label: 'Under $100', value: 'under-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: 'Over $200', value: 'over-200' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }

    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = async (value) => {
    setQuery(value);
    
    if (value.length > 2) {
      await fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await axios.post(`${API}/search/autocomplete`, null, {
        params: { query: searchQuery },
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });
      
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setShowSuggestions(false);
    
    // Save to search history
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      const response = await axios.post(`${API}/search/smart`, {
        query: searchQuery,
        location: location || null,
        date_range: dateRange || null,
        category: category === 'All' ? null : category,
        max_results: 20
      }, {
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });

      if (onResults) {
        onResults(response.data);
      } else {
        navigate('/search-results', { 
          state: { 
            searchResults: response.data,
            query: searchQuery,
            location,
            category,
            searchType: 'smart'
          }
        });
      }
    } catch (error) {
      console.error('Smart search error:', error);
      if (onResults) {
        onResults({
          events: [],
          ai_analysis: "Smart search temporarily unavailable. Please try again.",
          search_interpretation: searchQuery
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!recognition) {
      alert('Voice search is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'event_name' && suggestion.event_id) {
      navigate(`/events/${suggestion.event_id}`);
    } else {
      setQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'recent_search':
        return <Clock className="w-4 h-4" />;
      case 'popular_search':
        return <TrendingUp className="w-4 h-4" />;
      case 'event_name':
        return <Star className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  if (isMainSearch) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="smart-search-main">
        {/* Main Search Card */}
        <Card className="p-8 glass relative">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>
              AI-Powered Smart Search
            </h2>
            <p className="text-gray-600">
              Ask naturally - "rock concerts this weekend", "tech events under $100", or anything you have in mind
            </p>
          </div>

          {/* Search Input with Suggestions */}
          <div className="relative mb-4" ref={suggestionsRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => query.length > 2 && setShowSuggestions(true)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask me anything... 'Rock concerts this weekend' or 'Free tech events near me'"
                className="w-full pl-12 pr-20 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                data-testid="smart-search-input"
              />
              
              {/* Voice Search Button */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                )}
                {recognition && (
                  <button
                    onClick={handleVoiceSearch}
                    className={`p-2 rounded-lg transition-colors ${
                      isListening 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                    }`}
                    data-testid="voice-search-btn"
                    title={isListening ? 'Stop listening' : 'Voice search'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="text-gray-400">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{suggestion.text}</p>
                      {suggestion.type === 'recent_search' && (
                        <p className="text-xs text-gray-500">Recent search</p>
                      )}
                      {suggestion.type === 'popular_search' && (
                        <p className="text-xs text-gray-500">Popular search</p>
                      )}
                      {suggestion.type === 'event_name' && (
                        <p className="text-xs text-purple-600">Event</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                data-testid="location-input"
              />
            </div>
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              data-testid="category-select"
            >
              <option value="">Any Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="flex items-center"
              data-testid="advanced-toggle"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'More'} Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4" data-testid="advanced-filters">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="Date range (e.g., 'this weekend', 'next month')"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    data-testid="date-range-input"
                  />
                </div>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  data-testid="price-range-select"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="w-full btn-primary text-lg py-3 mb-4"
            data-testid="search-button"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI is searching...
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Search with AI
              </>
            )}
          </Button>

          {/* Personalized Touch */}
          {user && (
            <div className="text-center text-sm text-purple-600 mb-4">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Personalized results based on your preferences
            </div>
          )}
        </Card>

        {/* Search Examples */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Try These Smart Searches:
          </h3>
          <div className="flex flex-wrap gap-2">
            {smartSearchExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(example);
                  handleSearch(example);
                }}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200"
                data-testid={`example-query-${index}`}
              >
                "{example}"
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Searches (if user has search history) */}
        {searchHistory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Recent Searches:
            </h3>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(historyQuery);
                    handleSearch(historyQuery);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  data-testid={`history-query-${index}`}
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Compact search bar for other pages
  return (
    <div className="w-full max-w-2xl mx-auto relative" data-testid="smart-search-compact" ref={suggestionsRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Smart search... 'comedy shows tonight' or 'tech events this week'"
          className="w-full pl-12 pr-32 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          data-testid="compact-search-input"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {recognition && (
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-lg transition-colors ${
                isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
              }`}
              title="Voice search"
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
          )}
          <Button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="px-4 py-2 btn-primary"
            data-testid="compact-search-button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown for Compact */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="text-gray-400">
                {getSuggestionIcon(suggestion.type)}
              </div>
              <span className="text-gray-900 text-sm">{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;