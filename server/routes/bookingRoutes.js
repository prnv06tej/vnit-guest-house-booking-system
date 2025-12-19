const express = require('express');
const router = express.Router();
// Import the controller to use the functions
const bookingController = require('../controllers/bookingController');

// 1. Create a new booking (Student)
router.post('/', bookingController.createBooking);

// 2. Get all pending bookings (Faculty Dashboard)
router.get('/pending', bookingController.getPendingBookings);

// --- NEW LINES START HERE ---

// 3. Check which rooms are free (When clicking "Approve")
router.get('/available', bookingController.getAvailableRooms);

// 4. Approve and Assign Room (When clicking "Confirm")
router.put('/assign/:id', bookingController.assignRoom);

// --- NEW LINES END HERE ---

// 5. Reject booking (Update status only)
router.put('/:id', bookingController.updateStatus);

module.exports = router;