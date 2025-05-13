const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  userDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add a pre-save middleware to handle updates
reviewSchema.pre('save', function(next) {
  // If this is an update and userDetails is not provided, don't validate it
  if (this.isModified('reports') && !this.isModified('userDetails')) {
    this.userDetails = this.userDetails || this._doc.userDetails;
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
