const express = require("express");
const { getIpStats, getReportedReviews, deleteReport } = require("../controller/adminController");

const router = express.Router();

// Admin routes - all require admin authentication
router.get("/ip-stats", getIpStats);
router.get("/reports", getReportedReviews);
router.delete("/reports/:reportId", deleteReport);

// Add a test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working" });
});

module.exports = router; 