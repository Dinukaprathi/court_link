const User = require("../model/userModel");
const Review = require("../model/reviewModel");
const Report = require("../model/reportModel");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

// Get IP statistics
const getIpStats = async (req, res) => {
  try {
    console.log('Fetching IP stats...');
    
    // Check if user is admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      console.log('User is not admin');
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Get all users
    const users = await User.find({}, { password: 0 });
    console.log(`Found ${users.length} users`);
    
    // Group users by IP address
    const ipGroups = {};
    
    users.forEach(user => {
      const ip = user.ipAddress || 'unknown';
      if (!ipGroups[ip]) {
        ipGroups[ip] = {
          _id: ip,
          userCount: 0,
          profiles: [],
          lastSeen: user.lastLogin || new Date()
        };
      }
      
      ipGroups[ip].userCount++;
      ipGroups[ip].profiles.push({
        userId: user._id,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin || new Date()
      });
    });
    
    // Convert to array
    const ipStats = Object.values(ipGroups);
    console.log(`Grouped into ${ipStats.length} IP addresses`);
    
    res.json({ ipStats });
  } catch (error) {
    console.error('Error fetching IP stats:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get reported reviews
const getReportedReviews = async (req, res) => {
  try {
    console.log('Fetching reported reviews...');
    // Check if user is admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      console.log('User is not admin');
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Fetch all reports and populate the review and facility details
    const reportedReviews = await Report.find()
      .populate({
        path: 'reviewId',
        select: 'reviewText rating userDetails',
        populate: {
          path: 'userDetails',
          select: 'name'
        }
      })
      .populate({
        path: 'facilityId',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    console.log(`Found ${reportedReviews.length} reports`);
    res.json(reportedReviews);
  } catch (error) {
    console.error('Error fetching reported reviews:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { reportId } = req.params;
    
    // First find the report to get the reviewId
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Delete the associated review
    const deletedReview = await Review.findByIdAndDelete(report.reviewId);
    if (!deletedReview) {
      console.log('Review not found, but continuing with report deletion');
    }

    // Delete the report
    const deletedReport = await Report.findByIdAndDelete(reportId);
    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ 
      message: "Report and associated review deleted successfully",
      deletedReview: deletedReview ? deletedReview._id : null
    });
  } catch (error) {
    console.error('Error deleting report and review:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { 
  isAdmin,
  getIpStats, 
  getReportedReviews, 
  deleteReport 
}; 