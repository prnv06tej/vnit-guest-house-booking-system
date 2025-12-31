import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const StudentRegister = () => {
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: '', 
        studentId: '', 
        department: '', 
        phone: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🔵 Attempting to register with data:", formData);

        try {
            const res = await axios.post('https://vnit-guest-house-booking-system.onrender.com/api/auth/register', formData);
            console.log("🟢 Success Response:", res.data);
            alert('Registration Successful! Please Login.');
            navigate('/student-login');
        } catch (err) {
            console.error("🔴 Registration Error:", err);
            if (err.response) {
                // Server responded with a status code (like 400 or 500)
                alert(`Error: ${err.response.data.message}`);
                console.log("Server Message:", err.response.data);
            } else if (err.request) {
                // Request made but no response received (Server might be down)
                alert("Server not responding. Is the backend running on port 5000?");
            } else {
                alert("Request Setup Error: " + err.message);
            }
        }
    };

    // Styles
    const containerStyle = { maxWidth: '400px', margin: '50px auto', padding: '30px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' };
    const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#002147' }}>🎓 Student Registration</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
                <input name="studentId" placeholder="Student ID (e.g. BT21CSE099)" onChange={handleChange} required style={inputStyle} />
                <input name="department" placeholder="Department" onChange={handleChange} required style={inputStyle} />
                <input name="phone" placeholder="Phone Number" onChange={handleChange} required style={inputStyle} />
                
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Register</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account? <Link to="/student-login">Login Here</Link>
            </p>
        </div>
    );
};

export default StudentRegister;