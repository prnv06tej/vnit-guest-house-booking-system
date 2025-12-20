import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingForm = () => {
    // 1. State for all fields required by Backend
    const [formData, setFormData] = useState({
        studentName: '', 
        studentEmail: '', 
        enrollmentId: '', 
        govId: '', 
        reason: '',
        roomType: 'Single', 
        ac: 'false', 
        startDate: '', 
        endDate: ''
    });

    const [message, setMessage] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // 2. Handle Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Auto-Calculate Price (Optional but helpful)
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

    // 4. Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('⏳ Sending Request...');
        
        try {
            // Send data to Backend
            const response = await axios.post('http://localhost:5000/api/bookings', formData);
            
            // Success Message
            setMessage(`✅ ${response.data.message}`);
            
            // NOTE: We are NOT clearing the form automatically right now.
            // This lets you see what you typed if something goes wrong.

        } catch (error) {
            console.error("Booking Error:", error);
            if (error.response && error.response.data.message) {
                setMessage(`❌ ${error.response.data.message}`);
            } else {
                setMessage('❌ Server Error. Is the backend running?');
            }
        }
    };

    // 5. Styles
    const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: 'white' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Book a Guest Room</h2>
            
            {/* Message Box */}
            {message && <div style={{ 
                padding: '10px', marginBottom: '15px', borderRadius: '5px',
                backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', 
                color: message.includes('✅') ? '#155724' : '#721c24' 
            }}>
                {message}
            </div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Personal Details */}
                <fieldset style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                    <legend style={{ fontWeight: 'bold', color: '#555' }}>Student Details</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" name="studentName" placeholder="Full Name" value={formData.studentName} onChange={handleChange} required style={inputStyle} />
                        <input type="email" name="studentEmail" placeholder="Email" value={formData.studentEmail} onChange={handleChange} required style={inputStyle} />
                        <input type="text" name="enrollmentId" placeholder="Enrollment ID" value={formData.enrollmentId} onChange={handleChange} required style={inputStyle} />
                        <input type="text" name="govId" placeholder="Govt ID" value={formData.govId} onChange={handleChange} required style={inputStyle} />
                    </div>
                    <textarea name="reason" placeholder="Reason for stay..." value={formData.reason} onChange={handleChange} required style={{ ...inputStyle, width: '100%', marginTop: '10px' }}></textarea>
                </fieldset>

                {/* Booking Details */}
                <fieldset style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px' }}>
                    <legend style={{ fontWeight: 'bold', color: '#555' }}>Room Preference</legend>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select name="roomType" value={formData.roomType} onChange={handleChange} style={inputStyle}>
                            <option value="Single">Single Room</option>
                            <option value="Double">Double Room</option>
                        </select>
                        <select name="ac" value={formData.ac} onChange={handleChange} style={inputStyle}>
                            <option value="false">Non-AC</option>
                            <option value="true">AC</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem' }}>Check-in</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem' }}>Check-out</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                </fieldset>

                {/* Price Display */}
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#007bff' }}>
                    Estimated Bill: ₹{estimatedPrice}
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    Confirm Booking
                </button>
            </form>
        </div>
    );
};

export default BookingForm;