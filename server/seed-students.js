const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Define Student Schema Inline (to avoid path issues)
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error(err));

const seedStudents = async () => {
    try {
        // 1. Clear old students
        console.log('🧹 Clearing old student data...');
        await Student.deleteMany({});

        // 2. Hash the password "vnit123"
        // We use the same password for everyone for easy testing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('vnit123', salt);

        // 3. Define Dummy Students
        const students = [
            {
                name: "Rahul Verma",
                email: "rahul@vnit.ac.in",
                password: hashedPassword,
                studentId: "BT21CSE099",
                department: "Computer Science",
                phone: "9876543210"
            },
            {
                name: "Anjali Gupta",
                email: "anjali@vnit.ac.in",
                password: hashedPassword,
                studentId: "BT22ECE045",
                department: "Electronics",
                phone: "8765432109"
            },
            {
                name: "Vikram Singh",
                email: "vikram@vnit.ac.in",
                password: hashedPassword,
                studentId: "MT23EEE012",
                department: "Electrical",
                phone: "7654321098"
            },
            {
                name: "Priya Sharma",
                email: "priya@vnit.ac.in",
                password: hashedPassword,
                studentId: "BT20ME001",
                department: "Mechanical",
                phone: "6543210987"
            },
            {
                name: "Amit Patel",
                email: "amit@vnit.ac.in",
                password: hashedPassword,
                studentId: "BT21CHE033",
                department: "Chemical",
                phone: "5432109876"
            }
        ];

        // 4. Insert into DB
        await Student.insertMany(students);
        console.log(`✅ Successfully created ${students.length} dummy students!`);
        console.log('🔑 Password for all users: vnit123');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedStudents();