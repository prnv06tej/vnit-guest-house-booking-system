const Booking = require('../models/Booking');

// 1. Get All Pending Bookings (For Faculty Dashboard)
exports.getPendingBookings = async (req, res) => {
    try {
        // Ask Database: Find all bookings where status is 'pending'
        const bookings = await Booking.find({ status: 'pending' });
        
        // Send the list back to the Frontend
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Update Booking Status (Approve/Reject)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL
        const { status } = req.body; // Get the new status

        // Validation: Only allow "approved" or "rejected"
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        // Find and Update
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { status: status },
            { new: true } // Return the updated version
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: `Booking ${status}`, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};