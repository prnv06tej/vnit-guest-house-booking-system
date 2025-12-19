const Booking = require('../models/Booking');
const Room = require('../models/Room');

// 1. Get Pending Bookings (For Faculty Dashboard)
exports.getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Update Status (For Approve/Reject)
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Create a New Booking (Smart Version with Validation)
exports.createBooking = async (req, res) => {
    try {
        const { 
            studentName, studentEmail, enrollmentId, govId, reason, 
            roomType, ac, startDate, endDate 
        } = req.body;

        // Validation
        if (!studentName || !studentEmail || !enrollmentId || !govId || !reason || !startDate || !endDate) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() + 7); 
        
        // 7-Day Rule
        if (start < minDate) {
            return res.status(400).json({ message: "Booking must be at least 7 days in advance." });
        }

        // 5-Day Limit
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)); 
        if (diffDays > 5) {
            return res.status(400).json({ message: "Maximum stay allowed is 5 days." });
        }

        // Availability Check
        const totalRooms = await Room.countDocuments({ 
            type: roomType, 
            ac: (ac === 'true' || ac === true)
        });

        const clashingBookings = await Booking.countDocuments({
            roomType: roomType,
            ac: (ac === 'true' || ac === true),
            status: 'approved',
            $or: [
                { startDate: { $lt: end }, endDate: { $gt: start } }
            ]
        });

        if (clashingBookings >= totalRooms) {
            return res.status(400).json({ message: "Sold Out! No rooms available for these dates." });
        }

        // Price Calc
        let pricePerNight = 0;
        if (roomType === 'Single') pricePerNight = (ac === 'true' || ac === true) ? 400 : 300;
        else if (roomType === 'Double') pricePerNight = (ac === 'true' || ac === true) ? 800 : 600;
        const totalBill = pricePerNight * diffDays;

        const newBooking = new Booking({
            studentName, studentEmail, enrollmentId, govId, reason,
            roomType, ac: (ac === 'true' || ac === true),
            startDate, endDate,
            totalPrice: totalBill,
            status: 'pending'
        });

        const savedBooking = await newBooking.save();
        res.status(201).json({ message: "Request Sent! Total Bill: ₹" + totalBill, booking: savedBooking });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 4. Get Available Room Numbers (NEW)
exports.getAvailableRooms = async (req, res) => {
    try {
        const { roomType, ac, startDate, endDate } = req.query;
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Find occupied rooms
        const clashingBookings = await Booking.find({
            status: 'approved',
            $or: [
                { startDate: { $lt: end }, endDate: { $gt: start } }
            ]
        }).select('assignedRoomNumber');

        const occupiedRoomNumbers = clashingBookings.map(b => b.assignedRoomNumber).filter(n => n);

        // Find free rooms
        const availableRooms = await Room.find({
            type: roomType,
            ac: (ac === 'true' || ac === true),
            roomNumber: { $nin: occupiedRoomNumbers }
        }).select('roomNumber');

        res.json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching rooms", error: error.message });
    }
};

// 5. Assign Room & Approve (NEW)
exports.assignRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomNumber } = req.body;

        const updatedBooking = await Booking.findByIdAndUpdate(
            id, 
            { 
                status: 'approved', 
                assignedRoomNumber: roomNumber 
            }, 
            { new: true }
        );

        res.json({ message: `Room ${roomNumber} Assigned!`, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
};