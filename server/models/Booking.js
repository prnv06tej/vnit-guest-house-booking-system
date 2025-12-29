const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // --- LINK TO STUDENT ACCOUNT ---
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    
    // --- INDENTER INFO ---
    indenterName: { type: String, required: true },
    indenterDesignation: { type: String, default: 'Student' },
    indenterDepartment: { type: String, required: true },
    indenterPhone: { type: String, required: true },

    // --- GUEST INFO ---
    guestName: { type: String, required: true },
    guestAddress: { type: String, required: true },
    guestPhone: { type: String, required: true },
    guestOccupation: { type: String, required: true },

    // --- BOOKING DETAILS ---
    roomsRequired: { type: Number, required: true, default: 1 },
    arrivalDate: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    purpose: { type: String, required: true },
    
    // ✅ ROOM PREFERENCE (Single/Double, AC/Non-AC)
    roomType: { type: String, enum: ['Single', 'Double'], default: 'Single' },
    ac: { type: Boolean, default: false },

    // --- PAYMENT DETAILS ---
    amountPaid: { type: Number, required: true },
    challanNo: { type: String, required: true },
    receiptPath: { type: String, required: true }, // Path to the uploaded PDF

    // --- SYSTEM STATUS ---
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    assignedRoom: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);