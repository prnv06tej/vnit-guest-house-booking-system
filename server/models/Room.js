const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true }, // e.g., "G01"
    floor: { type: String, required: true },
    type: { type: String, enum: ['Single', 'Double'], required: true },
    ac: { type: Boolean, default: false },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'maintenance'], default: 'available' }
});

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);