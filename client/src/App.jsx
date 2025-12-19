import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import StudentStatus from './pages/StudentStatus'; // <--- NEW IMPORT

// Dummy placeholders
const FacultyDashboard = () => <h2>🔒 Faculty Dashboard</h2>;
const Home = () => <h2>🏠 Student Home Page (Public)</h2>;

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
        <Link to="/status" style={{ marginRight: '10px' }}>Check Status</Link> {/* <--- NEW LINK */}
        <Link to="/faculty">Faculty Dashboard</Link>
      </nav>

      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* NEW ROUTE */}
          <Route path="/status" element={<StudentStatus />} />

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

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import Login from './pages/Login';
// import PrivateRoute from './components/PrivateRoute';

// // Placeholder for the Faculty Dashboard (Pranav's part)
// // Since Pranav isn't here, we make a dummy one to test your security.
// const FacultyDashboard = () => <h2>🔒 Welcome to the Protected Faculty Dashboard</h2>;
// const Home = () => <h2>🏠 Student Home Page (Public)</h2>;

// function App() {
//   return (
//     <Router>
//       <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
//         <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
//         <Link to="/faculty">Faculty Dashboard</Link>
//       </nav>

//       <div style={{ padding: '20px' }}>
//         <Routes>
//           {/* Public Route */}
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />

//           {/* PROTECTED ROUTE (The Feature You Built) */}
//           <Route 
//             path="/faculty" 
//             element={
//               <PrivateRoute>
//                 <FacultyDashboard />
//               </PrivateRoute>
//             } 
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;