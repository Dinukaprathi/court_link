const express = require('express');
const reviewController = require('../controller/reviewController');
const router = express.Router();

// ✅ Mock user authentication middleware for testing
const mockUserMiddleware = (req, res, next) => {
  req.user = { _id: "60c72b8f5f9b3b452f4f9e8d" }; // Hardcoded user ID for testing
  next();
};

// ✅ Add a review for a specific facility
router.post('/:facilityId', mockUserMiddleware, reviewController.addReview);

// ✅ Get reviews for a specific facility
router.get('/:facilityId', reviewController.getReviews);

// ✅ Update a review
router.put('/:reviewId', reviewController.updateReview);

// ✅ Report a review
router.post('/:reviewId/report', reviewController.reportReview);

module.exports = router;
