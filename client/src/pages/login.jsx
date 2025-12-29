import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // --- SIMPLE HARDCODED CREDENTIALS ---
        if (username === 'admin' && password === 'vnit123') {
            setIsAuthenticated(true); // Unlock the app
           navigate('/admin-dashboard');   // Send to dashboard
        } else {
            setError('❌ Invalid Username or Password');
        }
    };

    // Styles
    const containerStyle = {
        height: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: "'Segoe UI', sans-serif"
    };
    const cardStyle = {
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        textAlign: 'center',
        width: '350px'
    };
    const inputStyle = {
        width: '100%',
        padding: '12px',
        margin: '10px 0',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };
    const btnStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#002147',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ color: '#002147', marginBottom: '20px' }}>🔐 Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        style={inputStyle}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={inputStyle}
                    />
                    
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    
                    <button type="submit" style={btnStyle}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;