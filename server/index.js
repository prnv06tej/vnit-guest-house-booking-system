const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); 

// 1. Load Environment Variables
dotenv.config();

// 2. Import Routes
const bookingRoutes = require('./routes/bookingRoutes');

// 3. Create the App (Initialize)
const app = express();

// 4. Middleware (The Setup)
app.use(express.json()); // Allows server to read JSON data

// 5. Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

  app.use(cors()); // Allow everyone to connect
// 6. Define Routes (The Doors)
// IMPORTANT: This must be AFTER 'const app = express()'
app.use('/api/bookings', bookingRoutes);

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));