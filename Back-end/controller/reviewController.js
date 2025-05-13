const mongoose = require('mongoose');
const Review = require('../model/reviewModel');
const Report = require('../model/reportModel');
const Facility = require('../model/userModel'); // Assuming you have a Facility model

exports.getReviews = async (req, res) => {
  try {
    const { facilityId } = req.params;

    // Ensure facilityId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(facilityId)) {
      return res.status(400).json({ error: "Invalid facility ID" });
    }

    const reviews = await Review.find({ facilityId })
      .populate('userDetails', 'username');

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Error fetching reviews", details: err.message });
  }
};

// Add a new review
exports.addReview = async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const { facilityId } = req.params;
    
    // Get user from session
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const userDetails = req.session.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(facilityId)) {
      return res.status(400).json({ error: "Invalid facility ID" });
    }

    const newReview = new Review({
      reviewText,
      rating,
      facilityId,
      userDetails
    });

    await newReview.save();
    
    // Populate user details before sending response
    const populatedReview = await Review.findById(newReview._id)
      .populate('userDetails', 'username');
      
    res.status(201).json({ message: "Review added successfully", review: populatedReview });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Error adding review", details: err.message });
  }
};

// ✅ Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { reviewText, rating },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review updated successfully", review: updatedReview });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ error: "Error updating review", details: err.message });
  }
};

// ✅ Report a review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Create a new report
    const newReport = new Report({
      reviewId,
      message,
      status: 'pending'
    });

    // Save the report
    await newReport.save();

    res.status(201).json({ 
      message: "Review reported successfully",
      report: newReport
    });
  } catch (err) {
    console.error("Error reporting review:", err);
    res.status(500).json({ error: "Error reporting review", details: err.message });
  }
};
