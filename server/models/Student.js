const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // We will hash this
    studentId: { type: String, required: true }, // e.g., BT21CSE099
    department: { type: String, required: true },
    phone: { type: String, required: true }
});

module.exports = mongoose.model('Student', studentSchema);