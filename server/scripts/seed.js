const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Fix Paths: Go up one level (../) to find .env and models
dotenv.config({ path: '../.env' }); 
const Room = require('../models/Room'); 

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DB Connected for Seeding"))
    .catch(err => {
        console.log("❌ DB Connection Error:", err);
        process.exit(1);
    });

const seedRooms = async () => {
    try {
        // 1. Clear existing rooms
        await Room.deleteMany({});
        console.log("🗑️  Old rooms cleared.");

        const rooms = [];

        // ===============================================
        // 🏠 GROUND FLOOR (G01 - G24)
        // Mostly Non-AC (Budget Friendly)
        // ===============================================
        for (let i = 1; i <= 24; i++) {
            const num = i < 10 ? `G0${i}` : `G${i}`; // G01, G02... G24
            
            // First 12 are Single Non-AC, Next 12 are Double Non-AC
            const isSingle = i <= 12;
            
            rooms.push({ 
                roomNumber: num, 
                type: isSingle ? 'Single' : 'Double', 
                ac: false, // Ground floor is Non-AC
                price: isSingle ? 300 : 600, 
                floor: 'Ground',
                status: 'available'
            });
        }

        // ===============================================
        // 🏢 1ST FLOOR (101 - 124)
        // Mix of AC and Non-AC
        // ===============================================
        for (let i = 101; i <= 124; i++) {
            // First 12 are Single AC, Next 12 are Single Non-AC
            const isAc = i <= 112;

            rooms.push({ 
                roomNumber: i.toString(), 
                type: 'Single', 
                ac: isAc, 
                price: isAc ? 400 : 300, 
                floor: '1st',
                status: 'available'
            });
        }

        // ===============================================
        // 🏙️ 2ND FLOOR (201 - 224)
        // Premium Floor (Mostly AC)
        // ===============================================
        for (let i = 201; i <= 224; i++) {
            // First 12 are Double AC, Next 12 are Single AC
            const isDouble = i <= 212;

            rooms.push({ 
                roomNumber: i.toString(), 
                type: isDouble ? 'Double' : 'Single', 
                ac: true, // All 2nd floor is AC
                price: isDouble ? 800 : 400, 
                floor: '2nd',
                status: 'available'
            });
        }

        // --- INSERT INTO DB ---
        await Room.insertMany(rooms);
        console.log(`✅ Successfully seeded ${rooms.length} rooms!`);
        console.log("   - Ground: 24 (Non-AC Mix)");
        console.log("   - 1st: 24 (Single Mix)");
        console.log("   - 2nd: 24 (AC Mix)");
        
        process.exit();

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedRooms();