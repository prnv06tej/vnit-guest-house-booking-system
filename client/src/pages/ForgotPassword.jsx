import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://vnit-guest-house-booking-system.onrender.com/api/auth/forgot-password', { email, studentId });
            alert(res.data.message);
            navigate('/student-login');
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        }
    };

    const styleInput = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
            <h2 style={{ textAlign: 'center', color: '#002147' }}>🔑 Forgot Password</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                Enter your Registered Email and Student ID. We will send a temporary password to your email.
            </p>
            <form onSubmit={handleSubmit}>
                <input placeholder="Student ID (e.g. BT21CSE099)" value={studentId} onChange={e=>setStudentId(e.target.value)} required style={styleInput} />
                <input type="email" placeholder="Registered Email" value={email} onChange={e=>setEmail(e.target.value)} required style={styleInput} />
                
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Reset Password</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                <Link to="/student-login">Back to Login</Link>
            </p>
        </div>
    );
};

export default ForgotPassword;