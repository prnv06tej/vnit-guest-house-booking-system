const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const Student = require('../models/Student');

// --- 1. EMAIL SETUP (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Send Email Function
const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: `"VNIT Guest House Admin" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text // Sends plain text (used for temp password)
        });
        console.log(`📧 Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email failed:", err.message);
    }
};

// --- 2. REGISTER ---
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

// --- 3. LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });
        if (!student) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || "SECRET_KEY_VNIT", { expiresIn: "1h" });
        
        res.json({ token, student }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 4. FORGOT PASSWORD (Generate Temp Pass) ---
router.post('/forgot-password', async (req, res) => {
    try {
        const { studentId, email } = req.body;

        // 1. Find student matching BOTH ID and Email
        const student = await Student.findOne({ studentId, email });
        if (!student) {
            return res.status(404).json({ message: "Student details not found." });
        }

        // 2. Generate Temporary Password
        const tempPassword = Math.random().toString(36).slice(-8); // e.g., "x7k9p2m1"
        
        // 3. Hash the temporary password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // 4. Update Database
        student.password = hashedPassword;
        await student.save();

        // 5. Send Email
        const emailText = `
Dear ${student.name},

We received a request to reset your password.

🔑 Your Temporary Password is: ${tempPassword}

Please login with this password immediately and change it from your Profile section.

Regards,
VNIT Guest House Admin
        `;

        await sendEmail(student.email, "Password Reset - VNIT Guest House", emailText);

        res.json({ message: "Temporary password sent to your email!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- 5. CHANGE PASSWORD ---
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

// --- 6. UPDATE PROFILE ---
router.put('/profile/:id', async (req, res) => {
    try {
        const { phone, department } = req.body; 
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id, 
            { phone, department },
            { new: true } // Return updated doc
        );
        res.json(updatedStudent);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;