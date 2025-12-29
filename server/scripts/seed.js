const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define Schemas
const roomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'Single' or 'Double'
    ac: { type: Boolean, required: true },
    price: { type: Number, required: true }
});
const Room = mongoose.model('Room', roomSchema);

const bookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.model('Booking', bookingSchema);

// Connect to Cloud DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error(err));

const seedData = async () => {
    try {
        // 1. CLEAR OLD DATA
        console.log('🧹 Clearing old data...');
        await Booking.deleteMany({});
        await Room.deleteMany({});

        const rooms = [];

        // --- HELPER FUNCTION TO CREATE ROOMS ---
        const createFloor = (prefix, start, end) => {
            for (let i = start; i <= end; i++) {
                // Format number to be 2 digits (e.g., 1 -> '01')
                const numStr = i < 10 ? `0${i}` : `${i}`;
                const roomNum = `${prefix}${numStr}`;
                
                let type = 'Single';
                let ac = false;
                let price = 300;

                // --- LOGIC FOR MIXING ROOM TYPES ---
                
                // GROUND FLOOR (G): Mostly Accessible / Non-AC
                if (prefix === 'G') {
                    if (i <= 10) { type = 'Single'; ac = false; price = 300; } // G01-G10
                    else { type = 'Double'; ac = false; price = 600; }         // G11-G20
                }
                
                // FIRST FLOOR (F): Premium / AC
                else if (prefix === 'F') {
                    if (i <= 10) { type = 'Single'; ac = true; price = 400; }  // F01-F10
                    else { type = 'Double'; ac = true; price = 800; }          // F11-F20
                }

                // SECOND FLOOR (S): Budget Mix
                else if (prefix === 'S') {
                    if (i <= 10) { type = 'Single'; ac = true; price = 400; }  // S01-S10 (AC)
                    else { type = 'Double'; ac = false; price = 600; }         // S11-S20 (Non-AC)
                }

                rooms.push({ roomNumber: roomNum, type, ac, price });
            }
        };

        // 2. GENERATE THE ROOMS
        console.log('🏗️ Generating rooms...');
        createFloor('G', 1, 20); // Ground Floor
        createFloor('F', 1, 20); // First Floor
        createFloor('S', 1, 20); // Second Floor

        // 3. INSERT INTO DB
        await Room.insertMany(rooms);
        console.log(`✅ Successfully created ${rooms.length} rooms!`);
        console.log('   - G01 to G20');
        console.log('   - F01 to F20');
        console.log('   - S01 to S20');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedData();