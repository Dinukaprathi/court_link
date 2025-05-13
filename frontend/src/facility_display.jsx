/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaPhone, FaEnvelope, FaEllipsisV, FaClock, FaCalendarAlt, FaInfoCircle } from "react-icons/fa"; 
import './facility_display.css';
import Navbar from './components/Navbar';
import axiosInstance from './config/axios';

const FacilityDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [reportingUserId, setReportingUserId] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  const reportReasons = [
    "Spam",
    "Harassment",
    "Fake Review",
    "Inappropriate Content",
    "Other"
  ];

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/api/facilities/${id}`)
        .then((res) => {
          setFacility(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching facility:", err);
          setError("Failed to load facility details.");
          setIsLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/api/reviews/${id}`, { withCredentials: true })
        .then((res) => {
          setReviews(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching reviews:", err);
          if (err.response?.status === 404) {
            setError("No reviews found for this facility.");
            setReviews([]);
          } else {
            setError("Failed to load reviews.");
          }
        });
    }
  }, [id]);

  useEffect(() => {
    if (isAutoPlaying && reviews.length > 1) {
      const timer = setInterval(() => {
        setCurrentReviewIndex((prevIndex) => 
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlaying, reviews.length]);

  const totalRatings = facility ? Object.values(facility.ratings || {}).reduce((sum, count) => sum + count, 0) : 0;

  const nextReview = () => {
    setIsAutoPlaying(false);
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <FaStar 
            key={index} 
            className={`star ${index < rating ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReportUser = async (reviewId) => {
    if (!selectedReason) {
      alert("Please select a reason to report.");
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/api/reports/${reviewId}`, {
        message: selectedReason
      });
      
      if (response.status === 201) {
        alert("Review reported successfully. Admin has been notified.");
        setShowReportModal(false);
        setSelectedReason('');
        setSelectedReview(null);
      }
    } catch (err) {
      console.error("Error reporting review:", err);
      if (err.response?.status === 400) {
        alert(err.response.data.error || "Invalid report data. Please try again.");
      } else if (err.response?.status === 404) {
        alert("Review not found. Please try again.");
      } else {
        alert("Failed to report the review. Please try again later.");
      }
    }
  };

  const checkLoginStatus = () => {
    const loggedInUserId = localStorage.getItem("userId");
    return loggedInUserId ? true : false;
  };

  const handleDropdownClick = (reviewId, event) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === reviewId ? null : reviewId);
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.review-dropdown')) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleReportClick = (review) => {
    setSelectedReview(review);
    setShowReportModal(true);
    setActiveDropdown(null);
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReview(null);
    setSelectedReason('');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Navbar />
        <div className="loading-spinner"></div>
        <p>Loading facility details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="facility-page">
        <Navbar />
        <div className="error-container">
          <FaInfoCircle className="error-icon" />
        <p className="error-message">{error}</p>
          <button className="back-button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="facility-page">
      <Navbar />
      
      {/* Hero section with parallax effect */}
      <div className="facility-hero">
        <div className="hero-image-container">
          {facility.image ? (
            <img 
              src={facility.image} 
              alt={facility.name} 
              className="main-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/1200x400?text=No+Image+Available';
              }}
            />
          ) : (
            <div className="no-image-placeholder">
              <span>No Image Available</span>
            </div>
          )}
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1>{facility.name}</h1>
          <div className="facility-rating">
            {renderStars(facility.averageRating || 0)}
            <span className="rating-text">
              {(facility.averageRating ? Number(facility.averageRating).toFixed(1) : '0.0')} ({totalRatings} reviews)
            </span>
          </div>
          <div className="hero-actions">
            <button 
              className="primary-button" 
              onClick={() => navigate(`/update-review/${id}`)}
            >
              Write a Review
            </button>
            <button 
              className="secondary-button"
              onClick={() => window.scrollTo({ top: document.querySelector('.facility-details').offsetTop, behavior: 'smooth' })}
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="quick-info-bar">
        <div className="info-item">
          <FaMapMarkerAlt className="info-icon" />
          <span>{facility.location?.city}, {facility.location?.country}</span>
                </div>
              {facility.contact?.phone && (
          <div className="info-item">
            <FaPhone className="info-icon" />
                  <span>{facility.contact.phone}</span>
                </div>
              )}
              {facility.contact?.email && (
          <div className="info-item">
            <FaEnvelope className="info-icon" />
                  <span>{facility.contact.email}</span>
                </div>
              )}
        {facility.hours && (
          <div className="info-item">
            <FaClock className="info-icon" />
            <span>{facility.hours}</span>
          </div>
        )}
        </div>

      {/* Main Content */}
      <div className="facility-details">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="section-card">
                <h2>About {facility.name}</h2>
                <div className="description" dangerouslySetInnerHTML={{ __html: facility.description }}></div>
              </div>
              
              <div className="section-card">
          <h2>Rating Overview</h2>
                <div className="rating-summary">
                  <div className="average-rating">
                    <div className="rating-circle">
                      <span className="rating-number">{(facility.averageRating ? Number(facility.averageRating).toFixed(1) : '0.0')}</span>
                      <div className="rating-stars">{renderStars(facility.averageRating || 0)}</div>
                      <span className="rating-count">{totalRatings} reviews</span>
                    </div>
                  </div>
                  <div className="rating-breakdown">
                    {["fiveStars", "fourStars", "threeStars", "twoStars", "oneStar"].map((star, index) => (
              <div key={index} className="rating-bar-container">
                  <span className="star-label">
                          {5 - index} <FaStar className="star-icon" />
                  </span>
                <div className="rating-bar">
                  <div 
                    className="rating-fill" 
                            style={{ width: `${(facility.ratings?.[star] / totalRatings) * 100 || 0}%` }}
                  ></div>
                </div>
                <span className="rating-count">{facility.ratings?.[star] || 0}</span>
              </div>
            ))}
          </div>
        </div>
              </div>
                        </div>
                      )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="section-card">
                <div className="reviews-header">
                  <h2>Customer Reviews</h2>
                  {checkLoginStatus() && (
                  <button 
                      className="write-review-button"
                      onClick={() => navigate(`/update-review/${id}`)}
                  >
                      Write a Review
                  </button>
                  )}
                </div>

          {reviews.length === 0 ? (
            <div className="no-reviews-container">
                    <div className="no-reviews-icon">
                      <FaStar />
                    </div>
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
              {checkLoginStatus() && (
                <button 
                  className="write-first-review-btn"
                  onClick={() => navigate(`/update-review/${id}`)}
                >
                  Write First Review
                </button>
              )}
            </div>
          ) : (
            <div className="reviews-carousel">
              <button className="carousel-button prev" onClick={prevReview}>
                <FaChevronLeft />
              </button>

              <div className="reviews-container">
                {reviews.map((review, index) => (
                  <div 
                    key={review._id} 
                    className={`review-card ${index === currentReviewIndex ? 'active' : ''}`}
                  >
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="profile-image">
                          {review.userDetails?.profileImage ? (
                            <img src={review.userDetails.profileImage} alt={review.userDetails.username} />
                          ) : (
                            <div className="default-avatar">
                              {(review.userDetails?.username || review.username || 'Anonymous').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="reviewer-details">
                          <h3>{review.userDetails?.username || review.username || "Anonymous"}</h3>
                          <div className="review-meta">
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                            <span className="review-date">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="review-actions">
                        <button 
                          className="review-dropdown-trigger"
                          onClick={(e) => handleDropdownClick(review._id, e)}
                        >
                          <FaEllipsisV />
                        </button>
                        {activeDropdown === review._id && (
                          <div className="review-dropdown">
                            <button 
                              className="dropdown-item"
                              onClick={() => handleReportClick(review)}
                            >
                              Report Review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="review-content">
                      <p dangerouslySetInnerHTML={{ __html: review.reviewText }}></p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="carousel-button next" onClick={nextReview}>
                <FaChevronRight />
              </button>

              <div className="carousel-indicators">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentReviewIndex ? 'active' : ''}`}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentReviewIndex(index);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="contact-section">
              <div className="section-card">
                <h2>Contact Information</h2>
                <div className="contact-details">
                  {facility.location && (
                    <div className="contact-item">
                      <div className="contact-icon-container">
                        <FaMapMarkerAlt className="contact-icon" />
                      </div>
                      <div className="contact-text">
                        <h3>Address</h3>
                        <p>{facility.location.address}, {facility.location.city}, {facility.location.country}</p>
                      </div>
                    </div>
                  )}
                  {facility.contact?.phone && (
                    <div className="contact-item">
                      <div className="contact-icon-container">
                        <FaPhone className="contact-icon" />
                      </div>
                      <div className="contact-text">
                        <h3>Phone</h3>
                        <p>{facility.contact.phone}</p>
                      </div>
                    </div>
                  )}
                  {facility.contact?.email && (
                    <div className="contact-item">
                      <div className="contact-icon-container">
                        <FaEnvelope className="contact-icon" />
                      </div>
                      <div className="contact-text">
                        <h3>Email</h3>
                        <p>{facility.contact.email}</p>
                      </div>
                    </div>
                  )}
                  {facility.hours && (
                    <div className="contact-item">
                      <div className="contact-icon-container">
                        <FaClock className="contact-icon" />
                      </div>
                      <div className="contact-text">
                        <h3>Hours</h3>
                        <p>{facility.hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="report-modal-overlay" onClick={handleCloseModal}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3>Report Review</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="report-modal-content">
              <div className="review-preview">
                <div className="reviewer-info">
                  <div className="profile-image">
                    {selectedReview?.userDetails?.profileImage ? (
                      <img src={selectedReview.userDetails.profileImage} alt={selectedReview.userDetails.username} />
                    ) : (
                      <div className="default-avatar">
                        {(selectedReview?.userDetails?.username || selectedReview?.username || 'Anonymous').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h4>{selectedReview?.userDetails?.username || selectedReview?.username || "Anonymous"}</h4>
                    <div className="review-meta">
                      <div className="review-rating">
                        {renderStars(selectedReview?.rating)}
                      </div>
                      <span className="review-date">
                        {formatDate(selectedReview?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="review-text">
                  <p dangerouslySetInnerHTML={{ __html: selectedReview?.reviewText }}></p>
                </div>
              </div>
              <div className="report-form">
                <label htmlFor="report-reason">Select a reason for reporting:</label>
                <select 
                  id="report-reason"
                  value={selectedReason} 
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="report-select"
                >
                  <option value="">Select Reason</option>
                  {reportReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
                <button 
                  className="submit-report-btn"
                  onClick={() => {
                    handleReportUser(selectedReview._id);
                    handleCloseModal();
                  }}
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityDisplay;
