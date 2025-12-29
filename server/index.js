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
    .catch(err => console.error(err));

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Use the routes
app.use('/api/auth', authRoutes);     // New Auth Routes
app.use('/api/bookings', bookingRoutes); // Updated Booking Routes
app.use('/api/rooms', roomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));