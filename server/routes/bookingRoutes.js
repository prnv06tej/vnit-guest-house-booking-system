const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Definition of the Doors

// 1. GET /api/bookings/pending
// When someone visits this URL, run the 'getPendingBookings' function
router.get('/pending', bookingController.getPendingBookings);

// 2. PUT /api/bookings/:id
// When someone tries to update a specific ID, run 'updateBookingStatus'
router.put('/:id', bookingController.updateBookingStatus);

module.exports = router;