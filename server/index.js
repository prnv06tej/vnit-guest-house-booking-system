const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');

// Load Models
const Student = require('./models/Student');
const Booking = require('./models/Booking');

dotenv.config();
const app = express();



// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// 1. SERVE UPLOADED FILES STATICALLY (Crucial for PDF viewing)
// This tells Express: "If someone asks for /uploads, look in the uploads folder"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE CONNECTION ---
// (Keep your existing connection logic here)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error("🔥 CRITICAL SERVER ERROR:", JSON.stringify(err, null, 2)));

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Use the routes
app.use('/api/auth', authRoutes);     // New Auth Routes
app.use('/api/bookings', bookingRoutes); // Updated Booking Routes
app.use('/api/rooms', roomRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR HANDLER CAUGHT:", err);
    if (err.message === 'File too large') {
        return res.status(400).json({ message: "File too large" });
    }
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: "Upload Error: " + err.message });
    }
    res.status(500).json({ message: "Server Error: " + err.message, error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));