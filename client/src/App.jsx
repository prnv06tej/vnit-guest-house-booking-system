import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login'; // This is now Admin Login
import AdminDashboard from './pages/AdminDashboard'; 

// Student Pages
import StudentRegister from './pages/StudentRegister';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';

// Components
import Footer from './components/Footer';
import vnitLogo from './assets/vnit-logo-1.jpg';

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false); 
  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsStudentAuthenticated(true);
  }, []);

  // Logout Handlers
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    setIsStudentAuthenticated(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* NAVBAR */}
      <nav style={{ padding: '10px 40px', backgroundColor: '#002147', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={vnitLogo} alt="VNIT Logo" style={{ height: '50px', borderRadius: '50%' }} />
            <h2 style={{ margin: 0 }}>VNIT Guest House</h2>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={linkStyle}>Home</Link>
          
          {/* Student Section */}
          {isStudentAuthenticated ? (
             <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/student-dashboard" style={linkStyle}>Student Dashboard</Link>
                <button onClick={handleStudentLogout} style={logoutBtnStyle}>Logout</button>
             </div>
          ) : (
             <Link to="/student-login" style={linkStyle}>Student Login</Link>
          )}

          <span style={{color: '#ffffff50'}}>|</span>

          {/* Admin Section (Updated Text) */}
          <Link to="/admin" style={{ ...linkStyle, color: '#f39c12', fontWeight: 'bold' }}>Admin Login</Link>
        </div>
      </nav>

      {/* ROUTES */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<StudentRegister />} />
          
          {/* Student Routes */}
          <Route 
            path="/student-login" 
            element={ isStudentAuthenticated ? <Navigate to="/student-dashboard" /> : <StudentLogin setStudentAuth={setIsStudentAuthenticated} /> } 
          />
          <Route 
            path="/student-dashboard" 
            element={ isStudentAuthenticated ? <StudentDashboard /> : <Navigate to="/student-login" /> } 
          />

          {/* Admin Routes (Renamed URL to /admin) */}
          <Route 
            path="/admin" 
            element={<Login setIsAuthenticated={setIsAdminAuthenticated} />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={ isAdminAuthenticated ? <AdminDashboard onLogout={handleAdminLogout} /> : <Navigate to="/admin" /> } 
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

const linkStyle = { color: 'white', textDecoration: 'none', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' };
const logoutBtnStyle = { backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };

export default App;