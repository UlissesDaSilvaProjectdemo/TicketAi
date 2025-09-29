import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Search, Sparkles, MapPin, Calendar, Filter, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AISearchBar = ({ onResults, isMainSearch = false }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const categories = [
    'All', 'Music', 'Sports', 'Technology', 'Arts', 'Business', 'Comedy', 'Theater'
  ];

  const exampleQueries = [
    "Find me rock concerts this weekend in New York",
    "Tech conferences next month near San Francisco", 
    "Comedy shows tonight under $50",
    "Art exhibitions in galleries this week",
    "Sports events for families with kids"
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/events/ai-search`, {
        query: searchQuery,
        location: location || null,
        date_range: dateRange || null,
        category: category === 'All' ? null : category,
        max_results: 20
      });

      if (onResults) {
        onResults(response.data);
      } else {
        // Navigate to search results page with results
        navigate('/search-results', { 
          state: { 
            searchResults: response.data,
            query: searchQuery,
            location,
            category
          }
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to simple search
      try {
        const fallbackResponse = await axios.get(`${API}/events/search`, {
          params: {
            q: searchQuery,
            location: location || undefined,
            category: category === 'All' ? undefined : category,
            max_results: 20
          }
        });
        
        if (onResults) {
          onResults(fallbackResponse.data);
        }
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        if (onResults) {
          onResults({
            events: [],
            ai_analysis: "Search temporarily unavailable. Please try again.",
            search_interpretation: searchQuery
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleExampleClick = (example) => {
    setQuery(example);
    handleSearch(example);
  };

  if (isMainSearch) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6" data-testid="ai-search-main">
        {/* Main Search Card */}
        <Card className="p-8 glass">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>
              AI-Powered Event Search
            </h2>
            <p className="text-gray-600">
              Search naturally - find concerts "tonight in NYC", tech events "next week", or any event you have in mind
            </p>
          </div>

          {/* Main Search Input */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... 'Rock concerts this weekend' or 'Tech events near me'"
                className="w-full pl-12 pr-12 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                data-testid="ai-search-input"
              />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3">
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
              <div className="bg-gray-50 rounded-lg p-4 space-y-3" data-testid="advanced-filters">
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
              </div>
            )}

            <Button
              onClick={() => handleSearch()}
              disabled={!query.trim() || isLoading}
              className="w-full btn-primary text-lg py-3"
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
          </div>
        </Card>

        {/* Example Queries */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Example Searches:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all duration-200"
                data-testid={`example-query-${index}`}
              >
                "{example}"
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Compact search bar for other pages
  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="ai-search-compact">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search with AI... 'comedy shows tonight' or 'tech events this week'"
          className="w-full pl-12 pr-32 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          data-testid="compact-search-input"
        />
        <Button
          onClick={() => handleSearch()}
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 btn-primary"
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
  );
};

export default AISearchBar;