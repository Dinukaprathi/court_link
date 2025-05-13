import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './update_reviews_&_ratings.css';
import Navbar from './components/Navbar';
import axiosInstance from './config/axios';

const UpdateReviewsAndRatings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // Create a ref for ReactQuill
  const quillRef = useRef(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/check');
        setIsAuthenticated(response.data.isAuthenticated);
        setUserId(response.data.user?._id);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUserId(null);
      }
    };

    checkAuth();
  }, []);

  // Fetch facility data
  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const response = await axiosInstance.get(`/api/facilities/${id}`);
        setFacility(response.data);
        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error("Error fetching facility:", error);
      }
    };

    fetchFacility();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }
    
    setIsSubmitting(true);
    const reviewText = quillRef.current.getEditor().root.innerHTML;

    try {
      const response = await axiosInstance.post(`/api/reviews/${id}`, {
        userDetails: userId,
        reviewText,
        rating
      });
      
      setReviews([...reviews, response.data.review]);
      setReviewText('');
      setRating(1);
      setIsSubmitting(false);
      
      alert('Review submitted successfully!');
      navigate(`/facility/${id}`);
    } catch (error) {
      console.error("Error submitting review:", error);
      setIsSubmitting(false);
      alert('Error submitting review. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        onClick={() => setRating(index + 1)}
        style={{ color: index < rating ? "gold" : "gray" }}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="review-page">
      <Navbar />
      {facility ? (
        <>
          <div className="review-header">
            <h1>Review for {facility.name}</h1>
          </div>

          <div className="review-form">
            <form onSubmit={handleSubmit}>
              <div className="review-editor">
                <ReactQuill
                  ref={quillRef}
                  value={reviewText}
                  onChange={setReviewText}
                  placeholder="Write your review here"
                />
              </div>

              <div className="rating-section">
                <label>Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ color: star <= rating ? "gold" : "gray" }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {showLoginAlert && (
                <div className="login-alert">
                  <p>Please <a href="/login">login</a> to submit a review.</p>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

          <div className="reviews-section">
            <h2>Existing Reviews</h2>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-content">
                    <div dangerouslySetInnerHTML={{ __html: review.reviewText }} />
                  </div>
                  <div className="review-meta">
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="loading">
          <p>Loading facility details...</p>
        </div>
      )}
    </div>
  );
};

export default UpdateReviewsAndRatings;
