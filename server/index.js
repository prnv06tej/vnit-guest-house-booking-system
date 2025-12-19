const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// --- ROUTES ---

// 1. Test Route
app.get('/', (req, res) => {
    res.send('VNIT Booking API is Running');
});

// 2. Pranav's Booking Route (Get all bookings)
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 3. YOUR NEW ROUTE (Get bookings by Student Email)
// *** UPDATED TO MATCH PRANAV'S SCHEMA ***
app.get('/api/bookings/student/:email', async (req, res) => {
    try {
        const emailToFind = req.params.email;
        // We search for 'studentEmail' because that is what Pranav named it in Booking.js
        const bookings = await Booking.find({ studentEmail: emailToFind });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 4. Create a Booking
app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));