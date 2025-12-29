const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected for Seeding Rooms'))
    .catch(err => console.log(err));

const seedRooms = async () => {
    try {
        await Room.deleteMany({}); // Clear old rooms
        const rooms = [];

        // Helper to determine price
        const getPrice = (type, ac) => {
            if (type === 'Single') return ac ? 400 : 300;
            if (type === 'Double') return ac ? 800 : 600;
        };

        // 1. Ground Floor (G01-G20) - Let's make them Single Non-AC
        for (let i = 1; i <= 20; i++) {
            rooms.push({
                roomNumber: `G${i.toString().padStart(2, '0')}`,
                floor: 'Ground',
                type: 'Single',
                ac: false,
                price: 300
            });
        }

        // 2. First Floor (F01-F20) - Single AC
        for (let i = 1; i <= 20; i++) {
            rooms.push({
                roomNumber: `F${i.toString().padStart(2, '0')}`,
                floor: 'First',
                type: 'Single',
                ac: true,
                price: 400
            });
        }

        // 3. Second Floor (S01-S20) - Double (Mix AC and Non-AC)
        for (let i = 1; i <= 20; i++) {
            const isAC = i > 10; // First 10 Non-AC, Next 10 AC
            rooms.push({
                roomNumber: `S${i.toString().padStart(2, '0')}`,
                floor: 'Second',
                type: 'Double',
                ac: isAC,
                price: isAC ? 800 : 600
            });
        }

        await Room.insertMany(rooms);
        console.log("✅ 60 Rooms Created (G01-S20) with correct prices!");
        process.exit();
    } catch (error) {
        console.log("❌ Error:", error);
        process.exit(1);
    }
};

seedRooms();