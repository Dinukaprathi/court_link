const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');

// Get all reports
router.get('/', reportController.getAllReports);

// Create a new report
router.post('/:reviewId', reportController.createReport);

// Delete a report
router.delete('/:reportId', reportController.deleteReport);

module.exports = router; 