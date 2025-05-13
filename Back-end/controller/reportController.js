const mongoose = require('mongoose');
const Report = require('../model/reportModel');
const Review = require('../model/reviewModel');

exports.createReport = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    // Check if review exists and get facilityId
    const review = await Review.findById(reviewId).select('_id facilityId');
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Create a new report
    const newReport = new Report({
      reviewId,
      facilityId: review.facilityId,
      message,
      status: 'pending'
    });

    // Save the report
    const savedReport = await newReport.save();

    res.status(201).json({ 
      message: "Review reported successfully",
      report: savedReport
    });
  } catch (err) {
    console.error("Error creating report:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Invalid report data", details: err.message });
    }
    res.status(500).json({ error: "Error creating report", details: err.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    console.log('Fetching all reports...');
    
    // First, check if we can connect to the database
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({ error: "Database connection not ready" });
    }

    // Get the count of reports first
    const count = await Report.countDocuments();
    console.log(`Found ${count} reports in the database`);

    // Fetch all reports without any filters
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: 'reviewId',
        select: 'content rating',
        model: 'Review'
      })
      .populate({
        path: 'facilityId',
        select: 'name',
        model: 'Facility'
      });

    console.log('Successfully fetched reports:', reports.length);
    
    // Log the first report for debugging
    if (reports.length > 0) {
      console.log('Sample report:', JSON.stringify(reports[0], null, 2));
    }

    res.status(200).json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ 
      error: "Error fetching reports", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log('Attempting to delete report:', reportId);

    // Validate reportId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    // First find the report to ensure it exists
    const report = await Report.findById(reportId);
    if (!report) {
      console.log('Report not found:', reportId);
      return res.status(404).json({ error: "Report not found" });
    }

    // Delete the report using deleteOne for permanent deletion
    const deleteResult = await Report.deleteOne({ _id: reportId });
    
    if (deleteResult.deletedCount === 0) {
      console.log('Failed to delete report:', reportId);
      return res.status(500).json({ error: "Failed to delete report" });
    }

    console.log('Successfully deleted report:', reportId);
    res.status(200).json({ 
      message: "Report deleted successfully",
      reportId: reportId
    });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ 
      error: "Error deleting report", 
      details: err.message 
    });
  }
}; 