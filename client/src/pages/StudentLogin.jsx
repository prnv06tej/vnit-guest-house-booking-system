import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const StudentLogin = ({ setStudentAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            // Save Token and User Data to LocalStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('student', JSON.stringify(res.data.student));
            
            setStudentAuth(true); // Update App State
            navigate('/student-dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Login Failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <h2 style={{ textAlign: 'center', color: '#002147' }}>🎓 Student Login</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                New User? <Link to="/register">Register Here</Link>
            </p>
        </div>
    );
};
export default StudentLogin;
