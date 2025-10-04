import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Ticket, User, Mail, ExternalLink, Coins, CreditCard } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [creditBalance, setCreditBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserTickets();
    fetchCreditBalance();
  }, [user]);

  const fetchUserTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/tickets/user/${user.email}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load your tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreditBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching credit balance, token exists:', !!token);
      if (!token) {
        console.log('No token found, skipping credit balance fetch');
        return;
      }
      
      const response = await axios.get(`${API}/credits/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Credit balance response:', response.data);
      setCreditBalance(response.data);
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      console.error('Error response:', error.response?.data);
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

  const getTicketStatus = (purchaseDate) => {
    const now = new Date();
    const purchase = new Date(purchaseDate);
    const daysDiff = Math.floor((now - purchase) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return { text: 'Just Booked', class: 'badge-success' };
    if (daysDiff <= 7) return { text: 'Recent', class: 'badge-primary' };
    return { text: 'Confirmed', class: 'badge-success' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8" data-testid="user-dashboard">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="dashboard-welcome">
              Welcome back, {user.name}!
            </h1>
            <p className="text-indigo-100 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span data-testid="dashboard-user-email">{user.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Credit Balance Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Credit Balance</p>
                <p className="text-2xl font-bold text-emerald-900" data-testid="credit-balance">
                  {creditBalance ? creditBalance.balance : '...'}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  5 credits = 1 ticket booking
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/pricing">
                <Button 
                  size="sm" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="buy-credits-dashboard-btn"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Credits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="total-tickets-count">
                  {tickets.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="upcoming-events-count">
                  {tickets.filter(ticket => new Date(ticket.purchase_date) > new Date()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="total-spent">
                  ${tickets.reduce((total, ticket) => total + ticket.price, 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
          <Link to="/">
            <Button className="btn-primary" data-testid="browse-more-events-dashboard-btn">
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6" data-testid="dashboard-error">
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              onClick={fetchUserTickets}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="no-tickets-title">
                No tickets yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't booked any tickets yet. Discover amazing events and book your first ticket!
              </p>
              <Link to="/">
                <Button className="btn-primary" data-testid="discover-events-btn">
                  Discover Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => {
              const status = getTicketStatus(ticket.purchase_date);
              return (
                <Card 
                  key={ticket.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300"
                  data-testid={`ticket-card-${ticket.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-1" data-testid={`ticket-event-name-${ticket.id}`}>
                          Event Ticket
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Ticket ID: <span className="font-mono" data-testid={`ticket-id-${ticket.id}`}>
                            {ticket.id.substring(0, 8).toUpperCase()}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={`${status.class} ml-4`} data-testid={`ticket-status-${ticket.id}`}>
                        {status.text}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Ticket Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Ticket Type</p>
                        <p className="font-medium" data-testid={`ticket-type-${ticket.id}`}>
                          {ticket.ticket_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price Paid</p>
                        <p className="font-semibold text-green-600" data-testid={`ticket-price-${ticket.id}`}>
                          ${ticket.price}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Booked On</p>
                        <p className="font-medium" data-testid={`ticket-purchase-date-${ticket.id}`}>
                          {formatDate(ticket.purchase_date)}
                        </p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Entry QR Code</p>
                          <p className="text-xs text-gray-600">
                            Show this at the event entrance
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={ticket.qr_code}
                            alt="Ticket QR Code"
                            className="w-full h-full object-contain"
                            data-testid={`ticket-qr-${ticket.id}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-4">
                      <Button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = ticket.qr_code;
                          link.download = `ticket-${ticket.id.substring(0, 8)}.png`;
                          link.click();
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full btn-secondary"
                        data-testid={`download-qr-btn-${ticket.id}`}
                      >
                        Download QR Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;