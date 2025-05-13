import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/check', { withCredentials: true });
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
        } else {
          setError('Failed to load user data. Please try again later.');
          console.error('Error fetching user data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-container">
          <div className="error-message">{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>User Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </header>
        
        <div className="user-info">
          <h2>Welcome, {user?.name || 'User'}!</h2>
          <p>Email: {user?.email}</p>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-section">
            <h3>Your Activity</h3>
            <p>You can view and manage your court facility interactions here.</p>
          </div>
          
          <div className="dashboard-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Browse Facilities</a></li>
              <li><a href="/facility/1">View Recent Facility</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 