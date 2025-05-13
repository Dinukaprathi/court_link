const express = require('express');
const router = express.Router();
const { getFacilityById, getFacilities, rateFacility } = require('../controller/FacilityController');

// Route to get a facility by ID
router.get('/facilities/:id', getFacilityById);

// Other routes like getFacilities or rateFacility can also go here
router.get('/facilities', getFacilities);

router.post('/rate', rateFacility);

module.exports = router;
