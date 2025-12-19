import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import StudentStatus from './pages/StudentStatus';
import FacultyDashboard from './FacultyDashboard'; // <--- KEEP PRANAV'S REAL IMPORT

// Placeholder for Home Page (We will build a real one later)
const Home = () => <h2>🏠 Student Home Page (Public)</h2>;

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
        <Link to="/status" style={{ marginRight: '10px' }}>Check Status</Link>
        <Link to="/faculty">Faculty Dashboard</Link>
      </nav>

      <div style={{ padding: '20px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/status" element={<StudentStatus />} />

          {/* PROTECTED ROUTE (Your Security wrapping Pranav's Dashboard) */}
          <Route 
            path="/faculty" 
            element={
              <PrivateRoute>
                <FacultyDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;