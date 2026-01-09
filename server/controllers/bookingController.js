const Booking = require('../models/Booking');
const Room = require('../models/Room');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const nodemailer = require('nodemailer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- EMAIL CONFIGURATION ---
// ✅ REPLACE THE OLD TRANSPORTER WITH THIS
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Explicitly telling it "Go to Gmail"
    port: 465,              // Explicitly using the Secure SSL Port (Firewall friendly)
    secure: true,           // "True" for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- ✨ NEW: PROFESSIONAL HTML EMAIL TEMPLATE ---
const sendEmail = async (to, subject, htmlContent) => {
    if (!to || to === 'N/A') return;

    const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #002147; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">VNIT Guest House</h2>
        </div>
        
        <div style="padding: 25px; color: #333333; line-height: 1.6;">
            ${htmlContent}
        </div>

        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Visvesvaraya National Institute of Technology, Nagpur</p>
            <p style="margin: 5px 0 0;">This is an automated message. Please do not reply.</p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"VNIT Guest House" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: emailTemplate // ✅ Sending HTML now
        });
        console.log(`📧 HTML Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email failed:", err.message);
    }
};

// 1. SMART CREATE BOOKING
exports.createBooking = async (req, res) => {
    let localFilePath = null;
    try {
        console.log("📨 Request Body:", req.body); 

        let receiptUrl = "";
        if (req.file) {
            localFilePath = req.file.path;
            const uploadRes = await cloudinary.uploader.upload(localFilePath, { folder: 'vnit_receipts', resource_type: "auto" });
            receiptUrl = uploadRes.secure_url;
        }

        const {
            indenterName, indenterDepartment, indenterPhone, student, 
            studentEmail, enrollmentId, 
            guestName, guestAddress, guestPhone, guestOccupation,
            aadhar1, aadhar2,
            purpose, roomType, ac, floorPref,
            arrivalDate, departureDate,
            amountPaid, challanNo
        } = req.body;

        if (!indenterName || !guestName || !purpose || !arrivalDate || !departureDate) {
            throw new Error("Missing required fields.");
        }

        const start = new Date(arrivalDate);
        const end = new Date(departureDate);
        if (end <= start) throw new Error("Check-out must be after Check-in");

        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 5) throw new Error("Maximum stay is 5 days");

        const isAc = (String(ac).toLowerCase() === 'true');
        let pricePerNight = (roomType === 'Single') ? (isAc ? 400 : 300) : (isAc ? 800 : 600);
        const totalBill = pricePerNight * diffDays;

        const newBooking = new Booking({
            studentName: indenterName, 
            studentId: student, 
            department: indenterDepartment,
            studentPhone: indenterPhone,
            studentEmail: studentEmail || "N/A", 
            enrollmentId: enrollmentId || "N/A",
            guestName, guestPhone, guestAddress, guestOccupation,
            aadhar1, aadhar2,
            reason: purpose,
            startDate: start,
            endDate: end,
            roomType, ac: isAc, floorPref,
            totalPrice: totalBill,
            amountPaid: amountPaid || 0,
            challanNo, receiptUrl,
            status: 'pending'
        });

        const savedBooking = await newBooking.save();

        // ✅ 1. SEND "REQUEST RECEIVED" EMAIL
        if (studentEmail) {
            const emailBody = `
                <h3 style="color: #002147;">Booking Request Received</h3>
                <p>Dear <strong>${indenterName}</strong>,</p>
                <p>Your booking request has been successfully submitted and is pending approval.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                    <tr style="background-color: #f2f2f2;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Guest Name</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${guestName}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-In</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${new Date(arrivalDate).toLocaleDateString()}</td></tr>
                    <tr style="background-color: #f2f2f2;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-Out</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${new Date(departureDate).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Room Type</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${roomType} (${isAc ? 'AC' : 'Non-AC'})</td></tr>
                    <tr style="background-color: #f2f2f2;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Bill</strong></td><td style="padding: 10px; border: 1px solid #ddd;">₹${totalBill}</td></tr>
                </table>

                <p style="margin-top: 20px;">You will receive another email once the admin takes action on your request.</p>
            `;
            sendEmail(studentEmail, "Booking Request Received - VNIT Guest House", emailBody);
        }

        res.status(201).json({ success: true, message: "Request Sent!", booking: savedBooking });

    } catch (error) {
        console.error("❌ Process Error:", error.message);
        if (!res.headersSent) res.status(500).json({ message: error.message });
    } finally {
        try { if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); } catch (e) {}
    }
};

// 2. GET PENDING (Admin)
exports.getPendingBookings = async (req, res) => {
    try { const bookings = await Booking.find({ status: 'pending' }); res.json(bookings); }
    catch (e) { res.status(500).json({ message: e.message }); }
};

// 3. CHECK AVAILABILITY
exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;
        if (!checkIn || !checkOut) return res.status(400).json({ message: "Dates required" });
        
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid date format" });

        const conflicting = await Booking.find({ 
            status: 'approved', 
            startDate: { $lt: end }, 
            endDate: { $gt: start }
        }).select('assignedRoomNumber');
        
        const busyRooms = conflicting.map(b => b.assignedRoomNumber);
        const allRooms = await Room.find();
        
        const stats = {
            busyRooms: busyRooms,
            availableRooms: allRooms.filter(r => !busyRooms.includes(r.roomNumber)),
            totalAvailable: allRooms.length - busyRooms.length
        };
        res.json(stats);
    } catch (err) { 
        console.error("❌ Check Error:", err); 
        res.status(500).json({ error: err.message }); 
    }
};

// 4. ASSIGN ROOM
exports.assignRoom = async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'approved', assignedRoomNumber: req.body.roomNumber });
        res.json({ message: "Room Assigned!" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 5. UPDATE STATUS (With Stylized Email)
exports.updateStatus = async (req, res) => {
    try {
        const { status, assignedRoom } = req.body;
        const updateData = { status: status.toLowerCase() };
        if (assignedRoom) updateData.assignedRoomNumber = assignedRoom;

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: false } 
        );

        if (!updatedBooking) return res.status(404).json({ message: "Booking ID not found" });

        // ✅ 2. SEND APPROVAL/REJECTION EMAIL
        if (updatedBooking.studentEmail) {
            const isApproved = status.toLowerCase() === 'approved';
            const subject = isApproved ? "🎉 Booking Approved - VNIT Guest House" : "Booking Update - VNIT Guest House";
            
            const emailBody = isApproved ? `
                <h3 style="color: green;">Booking Approved ✅</h3>
                <p>Dear <strong>${updatedBooking.studentName}</strong>,</p>
                <p>We are pleased to inform you that your booking request for <strong>${updatedBooking.guestName}</strong> has been approved.</p>
                
                <div style="background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 0; font-size: 16px;"><strong>🏠 Allocated Room:</strong> <span style="font-size: 18px; color: #2e7d32;">${assignedRoom || 'To be assigned'}</span></p>
                </div>

                <p>Please ensure the guest carries a valid government ID proof upon arrival.</p>
            ` : `
                <h3 style="color: #d32f2f;">Booking Rejected ❌</h3>
                <p>Dear <strong>${updatedBooking.studentName}</strong>,</p>
                <p>We regret to inform you that your booking request for <strong>${updatedBooking.guestName}</strong> could not be accommodated at this time.</p>
                <p>Please contact the administration for further details or try booking for different dates.</p>
            `;

            sendEmail(updatedBooking.studentEmail, subject, emailBody);
        }

        res.json({ message: "Status Updated Successfully", booking: updatedBooking });

    } catch (e) {
        console.error("❌ Update Failed:", e);
        res.status(500).json({ message: e.message });
    }
};

// 6. STUDENT HISTORY
exports.getStudentBookings = async (req, res) => {
    try {
        const id = req.params.studentId || req.query.studentId;
        const bookings = await Booking.find({ studentId: id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 7. ROOM STATUS CHART
exports.getRoomStatus = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const allRooms = await Room.find().sort({ roomNumber: 1 });
        const active = await Booking.find({ status: 'approved', $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }] });
        const data = allRooms.map(r => {
            const b = active.find(bk => bk.assignedRoomNumber === r.roomNumber);
            return b ? { roomNumber: r.roomNumber, status: 'Occupied' } : { roomNumber: r.roomNumber, status: 'Available' };
        });
        res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 8. ALLOCATED ROOMS
exports.getAllocatedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'approved' }).sort({ assignedRoomNumber: 1 });
        res.json(bookings);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 9. UPLOAD RECEIPT
exports.uploadReceipt = async (req, res) => {
    let localFilePath = null;
    try {
        if (!req.file) return res.status(400).json({ message: "No file" });
        localFilePath = req.file.path;
        const uploadRes = await cloudinary.uploader.upload(localFilePath, { folder: 'vnit_receipts', resource_type: "auto" });
        await Booking.findByIdAndUpdate(req.body.bookingId, { receiptUrl: uploadRes.secure_url });
        res.json({ success: true, url: uploadRes.secure_url });
    } catch (e) { res.status(500).json({ message: e.message }); }
    finally { try { if(localFilePath) fs.unlinkSync(localFilePath); } catch(e){} }
};

// 10. DELETE BOOKING
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Booking.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Booking not found" });
        res.json({ message: "Booking deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
