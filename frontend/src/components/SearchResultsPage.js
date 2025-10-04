import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, DollarSign, Users, Sparkles, ExternalLink, Brain, Filter } from 'lucide-react';
import AISearchBar from './AISearchBar';
import EventCard from './EventCard';

const SearchResultsPage = () => {
  const location = useLocation();
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (location.state?.searchResults) {
      setResults(location.state.searchResults);
      setFilteredResults(location.state.searchResults.events || []);
    }
  }, [location.state]);

  useEffect(() => {
    if (results?.events) {
      let filtered = [...results.events];

      // Source filter
      if (sourceFilter !== 'all') {
        filtered = filtered.filter(event => event.source === sourceFilter);
      }

      // Price filter
      if (priceFilter !== 'all') {
        switch (priceFilter) {
          case 'free':
            filtered = filtered.filter(event => event.price === 0);
            break;
          case 'under50':
            filtered = filtered.filter(event => event.price < 50);
            break;
          case 'under100':
            filtered = filtered.filter(event => event.price < 100);
            break;
          case 'over100':
            filtered = filtered.filter(event => event.price >= 100);
            break;
          default:
            break;
        }
      }

      // Sort
      switch (sortBy) {
        case 'price_low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date':
          filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'relevance':
        default:
          // Keep original AI-ranked order
          break;
      }

      setFilteredResults(filtered);
    }
  }, [results, sourceFilter, priceFilter, sortBy]);

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

  const handleNewSearch = (newResults) => {
    setResults(newResults);
    setFilteredResults(newResults.events || []);
    // Reset filters
    setSourceFilter('all');
    setPriceFilter('all');
    setSortBy('relevance');
  };

  // getSourceBadge function moved to EventCard component

  if (!results) {
    return (
      <div className="max-w-6xl mx-auto space-y-8" data-testid="search-results-page">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Search</h1>
          <AISearchBar onResults={handleNewSearch} isMainSearch={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="search-results-page">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="search-results-title">
              Search Results
            </h1>
            <p className="text-gray-600 mt-1" data-testid="search-query">
              Searched for: "{location.state?.query || 'events'}"
              {location.state?.location && ` in ${location.state.location}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {filteredResults.length} of {results.events?.length || 0} events
            </p>
          </div>
        </div>

        {/* New Search Bar */}
        <AISearchBar onResults={handleNewSearch} />
      </div>

      {/* AI Analysis */}
      {results.ai_analysis && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-2" data-testid="ai-analysis-title">
                  AI Search Analysis
                </h3>
                <div 
                  className="text-purple-800 leading-relaxed ai-response-content" 
                  data-testid="ai-analysis-text"
                  dangerouslySetInnerHTML={{ __html: results.ai_analysis }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sort */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            data-testid="source-filter"
          >
            <option value="all">All Sources</option>
            <option value="local">Local Events</option>
            <option value="ticketmaster">TicketMaster</option>
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            data-testid="price-filter"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="under50">Under $50</option>
            <option value="under100">Under $100</option>
            <option value="over100">$100+</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            data-testid="sort-select"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="date">Date: Earliest First</option>
          </select>
        </div>
      </Card>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="no-results-title">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search for different events.
            </p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try New Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((event) => (
            <EventCard 
              key={event.id} 
              event={event}
              testIdPrefix="search-result"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;