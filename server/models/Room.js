const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true }, // e.g., "G01"
    type: { type: String, enum: ['Single', 'Double'], required: true },
    ac: { type: Boolean, default: false },
    price: { type: Number, required: true },
    floor: { type: String, default: 'Ground' },
    status: { type: String, enum: ['available', 'maintenance'], default: 'available' }
});

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);