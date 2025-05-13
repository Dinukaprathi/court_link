const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'reports' });

// Create the model using the default mongoose connection
const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 