import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingForm = () => {
    // Defines the empty state for easy resetting
    const initialFormState = {
        studentName: '', 
        studentEmail: '', 
        enrollmentId: '', 
        studentId: '', 
        reason: '',
        roomType: 'Single', 
        ac: 'false', 
        startDate: '', 
        endDate: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    useEffect(() => {
        const { roomType, ac, startDate, endDate } = formData;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = (end - start) / (1000 * 60 * 60 * 24);
            
            if (days > 0) {
                let price = 0;
                if (roomType === 'Single') price = (ac === 'true') ? 400 : 300;
                else price = (ac === 'true') ? 800 : 600;
                setEstimatedPrice(price * days);
            } else {
                setEstimatedPrice(0);
            }
        }
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('⏳ Sending Request...');
        
        try {
            const response = await axios.post('http://localhost:5000/api/bookings', formData);
            setMessage(`✅ ${response.data.message}`);

            //Auto-Clear after 5 seconds
            setTimeout(() => {
                setFormData(initialFormState); // Wipe the form
                setMessage(''); // Remove the success message
                setEstimatedPrice(0); // Reset price display
            }, 5000); 

        } catch (error) {
            console.error("Booking Error:", error);
            if (error.response && error.response.data.message) {
                setMessage(`❌ ${error.response.data.message}`);
            } else {
                setMessage('❌ Server Error. Is the backend running?');
            }
        }
    };

    // Styles
    const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: "'Segoe UI', sans-serif" };
    const sectionStyle = { marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' };
    const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block', color: '#555', fontSize: '0.9rem' };
    const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' };
    const rowStyle = { display: 'flex', gap: '20px', marginBottom: '10px' };
    const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

    return (
        <div style={containerStyle}>
            <h2 style={{ textAlign: 'center', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>🏨 Guest House Booking</h2>
            
            {message && <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '6px', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

            <form onSubmit={handleSubmit}>
                <div style={sectionStyle}>
                    <h3 style={{marginTop: 0, color: '#007bff'}}>Student Details</h3>
                    <div style={rowStyle}>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Full Name</label>
                            <input type="text" name="studentName" placeholder="e.g. Rahul Verma" value={formData.studentName} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="studentEmail" placeholder="e.g. rahul@vnit.ac.in" value={formData.studentEmail} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Enrollment No.</label>
                            <input type="text" name="enrollmentId" placeholder="e.g. BT21CSE099" value={formData.enrollmentId} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Student ID</label>
                            <input type="text" name="studentId" placeholder="e.g. 31714" value={formData.studentId} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    <label style={labelStyle}>Reason for Stay</label>
                    <textarea name="reason" placeholder="Reason..." value={formData.reason} onChange={handleChange} required style={{ ...inputStyle, height: '80px', resize: 'vertical' }}></textarea>
                </div>

                <div style={sectionStyle}>
                    <h3 style={{marginTop: 0, color: '#007bff'}}>Room Preference</h3>
                    <div style={rowStyle}>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Room Type</label>
                            <select name="roomType" value={formData.roomType} onChange={handleChange} style={inputStyle}>
                                <option value="Single">Single Room</option>
                                <option value="Double">Double Room</option>
                            </select>
                        </div>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>AC Preference</label>
                            <select name="ac" value={formData.ac} onChange={handleChange} style={inputStyle}>
                                <option value="false">Non-AC</option>
                                <option value="true">AC</option>
                            </select>
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Check-in Date</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{flex: 1}}>
                            <label style={labelStyle}>Check-out Date</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                    Total Bill: ₹{estimatedPrice}
                </div>

                <button type="submit" style={buttonStyle}>Confirm Booking</button>
            </form>
        </div>
    );
};

export default BookingForm;