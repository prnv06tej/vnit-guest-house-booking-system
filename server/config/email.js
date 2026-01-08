const nodemailer = require('nodemailer');
require('dotenv').config();

// 👇 PASTE THESE 2 LINES HERE 👇
console.log("📧 DEBUG EMAIL:", process.env.EMAIL_USER); 
console.log("🔑 DEBUG PASS:", process.env.EMAIL_PASS ? "Loaded (Length: " + process.env.EMAIL_PASS.length + ")" : "NOT LOADED");
// 👆 ----------------------- 👆

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"VNIT Guest House" <' + process.env.EMAIL_USER + '>',
            to: to,
            subject: subject,
            text: text
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email failed:", error);
    }
};

module.exports = sendEmail;