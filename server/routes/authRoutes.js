const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const Student = require('../models/Student');

// --- EMAIL SETUP (Use your real Gmail for production) ---
// For this demo, we will just LOG the password to the console to avoid Gmail security blocks.
const sendEmail = async (to, subject, text) => {
    // 1. Create Transporter (If you have a real Gmail App Password, put it here)
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
    // });
    
    // 2. Simulate Sending (Check your VS Code Terminal!)
    console.log("========================================");
    console.log(`📧 MOCK EMAIL TO: ${to}`);
    console.log(`📝 SUBJECT: ${subject}`);
    console.log(`💬 MESSAGE: ${text}`);
    console.log("========================================");

    // await transporter.sendMail({ from: 'vnit-guest-house@vnit.ac.in', to, subject, text });
};

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId, department, phone } = req.body;
        const existingUser = await Student.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new Student({ name, email, password: hashedPassword, studentId, department, phone });
        await newStudent.save();

        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: student._id }, "SECRET_KEY_VNIT", { expiresIn: "1h" });
        
        // Return full student object so we can update profile later
        res.json({ token, student }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. FORGOT PASSWORD (Generate Temp Pass)
router.post('/forgot-password', async (req, res) => {
    try {
        const { studentId, email } = req.body;
        
        // Verify User
        const student = await Student.findOne({ studentId, email });
        if (!student) return res.status(404).json({ message: "No student found with these details." });

        // Generate Temp Password
        const tempPassword = Math.random().toString(36).slice(-8); // e.g., "x7z9q2w1"
        
        // Hash & Save
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        student.password = hashedPassword;
        await student.save();

        // Send Email (Mock)
        await sendEmail(student.email, 'Password Reset - VNIT Guest House', `Your new temporary password is: ${tempPassword}\nPlease login and change it immediately.`);

        res.json({ message: "Temporary password sent to your email (Check Server Console for Demo)" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
    try {
        const { studentId, oldPassword, newPassword } = req.body;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "User not found" });

        // Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        student.password = hashedPassword;
        await student.save();

        res.json({ message: "Password updated successfully!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. UPDATE PROFILE (Phone, Name, etc.)
router.put('/profile/:id', async (req, res) => {
    try {
        const { phone, department } = req.body; // Only allowing Phone/Dept update for now
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id, 
            { phone, department },
            { new: true } // Return updated doc
        );
        res.json(updatedStudent);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;