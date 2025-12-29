const express = require('express');
const router = express.Router();
// 👇 Change this: Import the model instead of defining it inline
const Room = require('../models/Room'); 

// GET ALL ROOMS
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;