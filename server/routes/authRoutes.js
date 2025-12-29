const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId, department, phone } = req.body;
        
        // Check if user exists
        const existingUser = await Student.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newStudent = new Student({
            name, email, password: hashedPassword, studentId, department, phone
        });
        await newStudent.save();

        res.status(201).json({ message: "Registration successful! Please login." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Create Token (This is the "Key" for the session)
        const token = jwt.sign({ id: student._id }, "SECRET_KEY_VNIT", { expiresIn: "1h" });

        res.json({ 
            token, 
            student: { 
                id: student._id, 
                name: student.name, 
                email: student.email,
                phone: student.phone,
                department: student.department
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;