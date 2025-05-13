import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaHome, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
          credentials: 'include'
        });
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUserRole(data.user?.role);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            Court Link
          </Link>
          <button className="navbar-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-center">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaHome className="nav-icon" />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/facilities" 
                  className={`nav-link ${location.pathname === '/facilities' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <FaBuilding className="nav-icon" />
                  <span>Facilities</span>
                </Link>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <Link 
                    to="/bookings" 
                    className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <FaCalendarAlt className="nav-icon" />
                    <span>My Bookings</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="navbar-right">
            <div className="nav-auth">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard'} 
                    className="nav-link dashboard-link"
                    onClick={closeMenu}
                  >
                    <FaUser className="nav-icon" />
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    className="auth-button logout-button"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    <FaSignOutAlt className="nav-icon" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="auth-button login-button"
                    onClick={closeMenu}
                  >
                    <FaSignInAlt className="nav-icon" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="auth-button signup-button"
                    onClick={closeMenu}
                  >
                    <FaUserPlus className="nav-icon" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 