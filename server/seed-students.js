const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student'); // Import your existing model

// Load env vars (to get the DB URL)
dotenv.config();

const seedStudents = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        // 1. CLEAR EXISTING STUDENTS (Start Fresh)
        console.log('🧹 Clearing old student data...');
        await Student.deleteMany({});

        // 2. CREATE A HASHED PASSWORD
        // We use the same password for everyone to make testing easy
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('vnit123', salt);

        // 3. DEFINE 15 DUMMY STUDENTS
        const students = [
            { name: "Aarav Patel", email: "aarav@vnit.ac.in", studentId: "BT21CSE001", department: "Computer Science", phone: "9876543201" },
            { name: "Ishita Sharma", email: "ishita@vnit.ac.in", studentId: "BT21CSE002", department: "Computer Science", phone: "9876543202" },
            { name: "Rohan Verma", email: "rohan@vnit.ac.in", studentId: "BT21ECE015", department: "Electronics", phone: "9876543203" },
            { name: "Sneha Gupta", email: "sneha@vnit.ac.in", studentId: "BT21ECE016", department: "Electronics", phone: "9876543204" },
            { name: "Vikram Singh", email: "vikram@vnit.ac.in", studentId: "BT21ME045", department: "Mechanical", phone: "9876543205" },
            { name: "Priya Das", email: "priya@vnit.ac.in", studentId: "BT21ME046", department: "Mechanical", phone: "9876543206" },
            { name: "Karan Mehta", email: "karan@vnit.ac.in", studentId: "BT21CHE012", department: "Chemical", phone: "9876543207" },
            { name: "Ananya Roy", email: "ananya@vnit.ac.in", studentId: "BT21CHE013", department: "Chemical", phone: "9876543208" },
            { name: "Rahul Nair", email: "rahul@vnit.ac.in", studentId: "BT21EEE033", department: "Electrical", phone: "9876543209" },
            { name: "Meera Iyer", email: "meera@vnit.ac.in", studentId: "BT21EEE034", department: "Electrical", phone: "9876543210" },
            { name: "Siddharth Rao", email: "sid@vnit.ac.in", studentId: "BT21CIV055", department: "Civil", phone: "9876543211" },
            { name: "Neha Joshi", email: "neha@vnit.ac.in", studentId: "BT21CIV056", department: "Civil", phone: "9876543212" },
            { name: "Aditya Malhotra", email: "adi@vnit.ac.in", studentId: "BT21MIN022", department: "Mining", phone: "9876543213" },
            { name: "Kavya Reddy", email: "kavya@vnit.ac.in", studentId: "BT21MIN023", department: "Mining", phone: "9876543214" },
            { name: "Arjun Kapoor", email: "arjun@vnit.ac.in", studentId: "MT23CSE005", department: "M.Tech CSE", phone: "9876543215" }
        ];

        // Add the hashed password to every student object
        const studentData = students.map(s => ({ ...s, password: hashedPassword }));

        // 4. INSERT INTO DATABASE
        await Student.insertMany(studentData);
        console.log(`🎉 Successfully added ${students.length} students!`);
        console.log('🔑 Password for all users: vnit123');

        // 5. DISCONNECT
        mongoose.connection.close();
        process.exit();

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedStudents();