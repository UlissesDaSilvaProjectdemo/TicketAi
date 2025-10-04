import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Components
import Header from "./components/Header";
import EventList from "./components/EventList";
import EventDetails from "./components/EventDetails";
import BookingForm from "./components/BookingForm";
import UserDashboard from "./components/UserDashboard";
import AuthModal from "./components/AuthModal";
import RecommendationsPage from "./components/RecommendationsPage";
import SearchResultsPage from "./components/SearchResultsPage";
import UKFestivalsShowcase from "./components/UKFestivalsShowcase";
import PricingPage from "./components/PricingPage";
import ChatBot from "./components/ChatBot";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(userData);
      setShowAuth(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`${API}/auth/register`, { name, email, password });
      return await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const authValue = {
    user,
    login,
    register,
    logout,
    showAuth,
    setShowAuth
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div className="App min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <BrowserRouter>
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<EventList events={events} />} />
              <Route path="/uk-festivals" element={<UKFestivalsShowcase />} />
              <Route path="/events/:eventId" element={<EventDetails events={events} />} />
              <Route 
                path="/book/:eventId" 
                element={user ? <BookingForm events={events} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/dashboard" 
                element={user ? <UserDashboard /> : <Navigate to="/" />} 
              />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Routes>
          </main>
          {showAuth && <AuthModal />}
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default App;