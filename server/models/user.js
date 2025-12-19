const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // No two users can have the same email
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'], // Only these 3 values are allowed
        default: 'student'
    }
});

// Create the model
const User = mongoose.model('User', UserSchema);

// Export it so other files can use it
module.exports = User;