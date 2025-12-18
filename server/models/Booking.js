const mongoose = require('mongoose');

// 1. Define the Rules (Schema)
const bookingSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true // Must have a name
    },
    studentEmail: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        enum: ['Single', 'Double', 'Suite'], // Can ONLY be one of these 3
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // The 3 states of a booking
        default: 'pending' // When created, it starts as pending
    }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt'

// 2. Export the Model
// This "Booking" variable is what we will use to find/update data later.
module.exports = mongoose.model('Booking', bookingSchema);