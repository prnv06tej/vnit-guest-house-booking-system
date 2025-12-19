// 1. Import dependencies
// Make sure you import the Booking model!
const Booking = require('./models/Booking');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // <--- NEW: Import Mongoose
require('dotenv').config();           // <--- NEW: Import and configure dotenv

// 2. Initialize the app
const app = express();

// 3. Middleware
app.use(express.json());
app.use(cors());

// 4. Database Connection  <--- NEW SECTION
// We read the secret key from the .env file
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
    // These settings prevent common warnings
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// 5. Test Route
app.get('/', (req, res) => {
    res.send('Hello from VNIT Booking Server!');
});

// 6. Start Server
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
// FEATURE 2: API to get bookings by Student Email
app.get('/api/bookings/student/:email', async (req, res) => {
    try {
        const studentEmail = req.params.email;
        // Find all bookings matching this email
        const bookings = await Booking.find({ email: studentEmail });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});