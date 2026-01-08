const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/multerConfig'); 

// 1. Create Booking
router.post('/create', upload.single('receipt'), bookingController.createBooking);

// 2. Availability Check (For Frontend Dashboard)
router.get('/check-availability', bookingController.checkAvailability);

// 3. Student History (Using ID param)
router.get('/student/:studentId', bookingController.getStudentBookings);

// 4. Admin Routes
router.get('/pending', bookingController.getPendingBookings);
router.get('/allocated', bookingController.getAllocatedBookings);
router.get('/room-status', bookingController.getRoomStatus);
router.put('/assign/:id', bookingController.assignRoom);
router.put('/:id/status', bookingController.updateStatus);

// // ✅ ADD THIS LINE: for deletion
router.delete('/:id', bookingController.deleteBooking);

// 5. Standalone Upload
router.post('/upload-receipt', upload.single('receipt'), bookingController.uploadReceipt);

module.exports = router;