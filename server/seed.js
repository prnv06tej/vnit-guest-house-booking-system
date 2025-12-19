const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected for Seeding'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        // Create a fake booking
        const newBooking = new Booking({
            studentName: "Rahul Sharma",
            studentEmail: "rahul@vnit.ac.in",
            roomType: "Single",
            startDate: new Date(),
            endDate: new Date(),
            status: "pending" // Crucial!
        });

        await newBooking.save();
        console.log("✅ Dummy Booking Inserted!");
        process.exit();
    } catch (error) {
        console.log("❌ Error:", error);
        process.exit(1);
    }
};

seedData();