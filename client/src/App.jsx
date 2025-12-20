import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import EVERYONE'S work
import BookingForm from './pages/BookingForm';      // Your work
import FacultyDashboard from './pages/FacultyDashboard'; // Your work
import Login from './pages/Login';                  // M1's work
import StudentStatus from './pages/StudentStatus';  // M1's work

// (Note: If your files are still in 'src' and not 'pages', remove the '/pages' part above)

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Student Booking</Link>
          <Link to="/status" style={{ marginRight: '15px' }}>Check Status</Link>
          <Link to="/login">Faculty Login</Link>
        </nav>

        <Routes>
          {/* Your Routes */}
          <Route path="/" element={<BookingForm />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          
          {/* M1's Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/status" element={<StudentStatus />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;