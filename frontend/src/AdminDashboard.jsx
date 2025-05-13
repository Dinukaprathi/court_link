import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [ipStats, setIpStats] = useState([]);
  const [reportedReviews, setReportedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const checkSession = useCallback(async () => {
    try {
      console.log('Checking admin session...');
      const response = await axios.get('http://localhost:5000/api/auth/check', {
        withCredentials: true
      });
      
      console.log('Admin session check response:', response.data);
      
      if (!response.data.isAuthenticated) {
        console.error('Not authenticated, redirecting to login');
        navigate('/login');
        return;
      }

      if (!response.data.user || response.data.user.role !== 'admin') {
        console.error('User is not an admin:', response.data.user);
        setError('You must be logged in as an admin to access this page.');
        navigate('/login');
        return;
      }
      
      console.log('Admin session verified, fetching data...');
      // If we're authenticated as admin, fetch the data
      fetchIPStats();
      fetchReportedReviews();
    } catch (err) {
      console.error('Session check error:', err);
      setError('Failed to verify your session. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchIPStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ip-stats', {
        withCredentials: true
      });
      setIpStats(response.data.ipStats);
    } catch (err) {
      setError('Failed to fetch IP statistics. Please try again.');
      console.error('Error fetching IP statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportedReviews = async () => {
    try {
      console.log('Fetching reported reviews...');
      const response = await axios.get('http://localhost:5000/api/reports', {
        withCredentials: true
      });
      
      console.log('Reports response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort reports by creation date (newest first)
        const sortedReports = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        console.log(`Successfully fetched ${sortedReports.length} reports`);
        if (sortedReports.length > 0) {
          console.log('Sample report:', sortedReports[0]);
        }
        
        setReportedReviews(sortedReports);
        setError(''); // Clear any previous errors
      } else {
        console.error('Unexpected reports data format:', response.data);
        setReportedReviews([]);
        setError('Invalid reports data format received from server');
      }
    } catch (err) {
      console.error('Error fetching reported reviews:', err);
      setError(err.response?.data?.error || 'Failed to fetch reported reviews. Please try again.');
      setReportedReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch reports when component mounts
  useEffect(() => {
    fetchReportedReviews();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          withCredentials: true
        });
        setIpStats(prevStats => 
          prevStats.map(ipGroup => ({
            ...ipGroup,
            profiles: ipGroup.profiles.filter(profile => profile.userId !== userId)
          }))
        );
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you sure you want to delete this report?')) {
          return;
        }

        console.log('Deleting report:', reportId);
        const response = await axios.delete(`http://localhost:5000/api/reports/${reportId}`, {
          withCredentials: true
        });

        console.log('Delete response:', response.data);
        
        if (response.data.message && response.data.message.includes('deleted successfully')) {
          // Remove the deleted report from the state
          setReportedReviews(prevReports => 
            prevReports.filter(report => report._id !== reportId)
          );
          setError(''); // Clear any previous errors
          
          // Refresh the reports list to ensure sync with database
          await fetchReportedReviews();
        } else {
          throw new Error('Unexpected response from server');
        }
      } else if (action === 'view') {
        // Navigate to the review details page
        const report = reportedReviews.find(r => r._id === reportId);
        if (report) {
          navigate(`/facility/${report.facilityId}#review-${report.reviewId}`);
        }
      }
    } catch (err) {
      console.error(`Error ${action}ing report:`, err);
      setError(err.response?.data?.error || `Failed to ${action} report. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <nav className="admin-navbar">
          <div className="nav-brand">Court Link Admin</div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </div>
        </nav>
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="nav-brand">Court Link Admin</div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/admin-dashboard" className="nav-link active">Dashboard</Link>
          <button onClick={handleLogout} className="nav-logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{ipStats.reduce((total, group) => total + group.userCount, 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Reported Reviews</h3>
              <p>{reportedReviews.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active IPs</h3>
              <p>{ipStats.length}</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reported Reviews
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>System Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Recent Reports</h3>
                  <div className="recent-reports">
                    {reportedReviews.slice(0, 5).map((report) => (
                      <div key={report._id} className="report-item">
                        <p>Review ID: {report.reviewId?._id || 'N/A'}</p>
                        <p>Review: {report.reviewId?.reviewText || 'No content available'}</p>
                        <p>Reason: {report.message || 'No reason provided'}</p>
                        <p>Reported: {new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overview-card">
                  <h3>Top IP Addresses</h3>
                  <div className="top-ips">
                    {ipStats.slice(0, 5).map((ipGroup) => (
                      <div key={ipGroup._id} className="ip-item">
                        <p>IP: {ipGroup._id}</p>
                        <p>Users: {ipGroup.userCount}</p>
                        <p>Last Active: {new Date(ipGroup.lastSeen).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-section">
              <h2>Reported Reviews</h2>
              {reportedReviews.length === 0 ? (
                <p className="no-reports">No reported reviews found.</p>
              ) : (
                <div className="reports-grid">
                  {reportedReviews.map((report) => (
                    <div key={report._id} className="report-card">
                      <div className="report-header">
                        <h3>Reported Review</h3>
                        <span className="report-date">
                          Reported on: {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="report-details">
                        {/* Review Content Section */}
                        <div className="review-section">
                          <h4>Review Content</h4>
                          <div className="review-content">
                            <p className="review-text">
                              {report.reviewId?.reviewText || 'Review content not available'}
                            </p>
                            {report.reviewId?.rating && (
                              <p className="review-rating">
                                Rating: {report.reviewId.rating}/5
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Report Reason Section */}
                        <div className="report-reason-section">
                          <h4>Report Reason</h4>
                          <div className="report-reason">
                            <p className="reason-text">
                              {report.message || 'No reason provided'}
                            </p>
                          </div>
                        </div>

                        {/* Facility and Status Section */}
                        <div className="report-metadata">
                          <div className="metadata-item">
                            <span className="label">Facility:</span>
                            <span className="value">
                              {report.facilityId?.name || 'Unknown Facility'}
                            </span>
                          </div>
                          <div className="metadata-item">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${report.status}`}>
                              {report.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="report-actions">
                        <button 
                          className="action-button view"
                          onClick={() => handleReportAction(report._id, 'view')}
                        >
                          View Full Review
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleReportAction(report._id, 'delete')}
                        >
                          Delete Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <h2>User Management</h2>
              {ipStats.length === 0 ? (
                <p className="no-users">No users found.</p>
              ) : (
                <div className="users-grid">
                  {ipStats.map((ipGroup) => (
                    <div key={ipGroup._id} className="user-group-card">
                      <div className="user-group-header">
                        <h3>IP Address: {ipGroup._id}</h3>
                        <p>Total Users: {ipGroup.userCount}</p>
                        <p>First Seen: {new Date(ipGroup.firstSeen).toLocaleString()}</p>
                        <p>Last Seen: {new Date(ipGroup.lastSeen).toLocaleString()}</p>
                      </div>
                      
                      <div className="users-list">
                        {ipGroup.profiles.map((profile) => (
                          <div key={profile.userId} className="user-card">
                            <div className="user-header">
                              <h4>{profile.username}</h4>
                              <p>{profile.email}</p>
                              <p>Device: {profile.deviceInfo}</p>
                              <p>Status: {profile.isActive ? 'Active' : 'Inactive'}</p>
                              {profile.isSuspicious && <span className="suspicious-badge">Suspicious</span>}
                            </div>

                            <div className="user-stats">
                              <div className="stat">
                                <span>Reviews</span>
                                <p>{profile.reviewCount}</p>
                              </div>
                              <div className="stat">
                                <span>Reports</span>
                                <p>{profile.reportedCount || 0}</p>
                              </div>
                              <div className="stat">
                                <span>Last Active</span>
                                <p>{new Date(profile.lastActive).toLocaleString()}</p>
                              </div>
                            </div>

                            <button
                              className="delete-user-btn"
                              onClick={() => handleDeleteUser(profile.userId)}
                            >
                              Delete User
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;