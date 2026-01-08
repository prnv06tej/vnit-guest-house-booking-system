import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Load API URL
const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
    const [formData, setFormData] = useState({ studentId: '', email: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Call the real backend route
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, formData);
            
            setMessage(`✅ Success! ${res.data.message}`);
            
            // Optional: Redirect after 5 seconds
            setTimeout(() => {
                navigate('/student-login');
            }, 5000);

        } catch (err) {
            setError('❌ ' + (err.response?.data?.message || "Failed to reset password. Check details."));
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const containerStyle = {
        height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: "'Segoe UI', sans-serif"
    };
    const cardStyle = {
        padding: '40px', backgroundColor: 'white', borderRadius: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)', textAlign: 'center', width: '400px'
    };
    const inputStyle = {
        width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #ccc',
        borderRadius: '5px', fontSize: '1rem'
    };
    const btnStyle = {
        width: '100%', padding: '12px', backgroundColor: '#f39c12', color: 'white',
        border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ color: '#002147', marginBottom: '20px' }}>🔑 Reset Password</h2>
                
                {message ? (
                    <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
                        <strong>{message}</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                            Check your inbox (and spam folder). Login with the temporary password and change it immediately.
                        </p>
                        <Link to="/student-login" style={{ color: '#155724', fontWeight: 'bold' }}>Go to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                            Enter your Student ID and Registered Email to receive a temporary password.
                        </p>

                        <input 
                            type="text" placeholder="Student ID" required 
                            value={formData.studentId} 
                            onChange={e => setFormData({...formData, studentId: e.target.value})} 
                            style={inputStyle} 
                        />
                        <input 
                            type="email" placeholder="Registered Email" required 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            style={inputStyle} 
                        />
                        
                        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                        
                        <button type="submit" style={btnStyle} disabled={loading}>
                            {loading ? 'Sending Email...' : 'Send Temporary Password'}
                        </button>

                        <div style={{ marginTop: '20px' }}>
                            <Link to="/student-login" style={{ color: '#007bff', textDecoration: 'none' }}>Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;