import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';

const Header = () => {
  const { user, logout, setShowAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>
                TicketAI
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Events</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              data-testid="nav-events"
            >
              Events
            </Link>
            <Link
              to="/recommendations"
              className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
              data-testid="nav-recommendations"
            >
              AI Recommendations
            </Link>
            <Link
              to="/pricing"
              className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
              data-testid="nav-pricing"
            >
              Pricing
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                data-testid="nav-dashboard"
              >
                My Tickets
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900" data-testid="user-name">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500" data-testid="user-email">
                    {user.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  data-testid="logout-btn"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuth(true)}
                className="btn-primary"
                data-testid="login-btn"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-4">
          <Link
            to="/"
            className={`nav-link text-sm ${isActive('/') ? 'active' : ''}`}
            data-testid="mobile-nav-events"
          >
            Events
          </Link>
          <Link
            to="/recommendations"
            className={`nav-link text-sm ${isActive('/recommendations') ? 'active' : ''}`}
            data-testid="mobile-nav-recommendations"
          >
            AI Recommendations
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`nav-link text-sm ${isActive('/dashboard') ? 'active' : ''}`}
              data-testid="mobile-nav-dashboard"
            >
              My Tickets
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;