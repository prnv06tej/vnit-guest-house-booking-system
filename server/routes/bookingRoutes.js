const express = require('express');
const router = express.Router();
const multer = require('multer');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// --- MULTER CONFIG (File Upload Logic) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save to 'uploads' folder
    },
    filename: function (req, file, cb) {
        // Name file: Date + Original Name (to avoid duplicates)
        cb(null, Date.now() + '-' + file.originalname); 
    }
});
const upload = multer({ storage: storage });

// 1. CREATE BOOKING (With File Upload)
// 'receipt' is the name of the input field in the frontend form
router.post('/', upload.single('receipt'), async (req, res) => {
    try {
        // req.body contains text fields, req.file contains the PDF
        const bookingData = {
            ...req.body,
            receiptPath: req.file.path // Save the file path to DB
        };

        const newBooking = new Booking(bookingData);
        await newBooking.save();
        res.status(201).json({ message: "Booking Request Submitted Successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// 2. GET BOOKINGS FOR A SPECIFIC STUDENT (For History Tab)
router.get('/student/:studentId', async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.params.studentId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET PENDING BOOKINGS (For Faculty)
router.get('/pending', async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'Pending' });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/rooms', async (req, res) => {
    try {
        // Find all rooms and sort them (G01, G02...)
        const rooms = await Room.find().sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status, assignedRoom } = req.body;
        
        // Create the update object
        const updateData = { status };
        
        // Only update assignedRoom if it's provided (i.e., when Approving)
        if (assignedRoom) {
            updateData.assignedRoom = assignedRoom;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });

        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;