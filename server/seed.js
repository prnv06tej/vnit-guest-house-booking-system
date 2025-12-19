const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('🧹 Clearing old bookings...');
        // Delete ALL bookings
        await Booking.deleteMany({});
        console.log('✅ All old bookings deleted. Database is clean.');
        process.exit();
    })
    .catch(err => console.log(err));