const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Indenter (Student) Details
    studentName: { type: String, required: true }, // Maps to indenterName
    studentEmail: { type: String, required: true },
    enrollmentId: { type: String, required: true }, // Ensure frontend sends this
    studentId: { type: String, required: true },
    studentPhone: { type: String, default: "" },   // Added
    department: { type: String, default: "" },     // Added

    // Guest Details (CRITICAL MISSING FIELDS ADDED)
    guestName: { type: String, required: true },
    guestPhone: { type: String, required: true },
    guestAddress: { type: String, required: true },
    guestOccupation: { type: String, default: "" },
    aadhar1: { type: String, default: "" },
    aadhar2: { type: String, default: "" },
    
    // Booking Details
    reason: { type: String, required: true }, // Maps to 'purpose'
    roomType: { type: String, enum: ['Single', 'Double'], required: true },
    floorPref: { type: String, default: "Any" }, // Added
    ac: { type: Boolean, default: false },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    
    // Payment & Receipt
    amountPaid: { type: Number, default: 0 }, // Added
    challanNo: { type: String, default: "" }, // Added
    receiptUrl: { type: String, default: "" }, 
    
    // Status
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    assignedRoomNumber: { type: String, default: null }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);