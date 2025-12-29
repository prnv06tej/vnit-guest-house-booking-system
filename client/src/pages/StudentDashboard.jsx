import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
    const [myBookings, setMyBookings] = useState([]);
    const [estimatedPrice, setEstimatedPrice] = useState(0); 
    const [dateError, setDateError] = useState(''); // 🔴 New Error State
    const navigate = useNavigate();

    // Get Logged In Student Data
    const student = JSON.parse(localStorage.getItem('student'));

    // Form State
    const [formData, setFormData] = useState({
        indenterName: student?.name || '',
        indenterDesignation: 'Student',
        indenterDepartment: student?.department || '',
        indenterPhone: student?.phone || '',
        guestName: '', guestAddress: '', guestPhone: '', guestOccupation: '',
        roomsRequired: 1, 
        arrivalDate: '', 
        departureDate: '', 
        purpose: '',
        roomType: 'Single', 
        ac: 'false',        
        amountPaid: '', 
        challanNo: ''
    });
    const [file, setFile] = useState(null);

    // 1. Redirect if not logged in
    useEffect(() => {
        if (!student) {
            navigate('/student-login');
            return;
        }
        fetchMyBookings();
    }, []);

    // 2. LIVE PRICE CALCULATION & DATE VALIDATION 🧮
    useEffect(() => {
        const calculatePrice = () => {
            // Reset error initially
            setDateError('');
            setEstimatedPrice(0);

            if (!formData.arrivalDate || !formData.departureDate) return;

            const start = new Date(formData.arrivalDate);
            const end = new Date(formData.departureDate);
            const now = new Date();

            // 🛑 VALIDATION: Check if Arrival is in the past
            if (start < now.setHours(0,0,0,0)) { // Compare with midnight today
                 setDateError('❌ Arrival date cannot be in the past.');
                 return;
            }

            // 🛑 VALIDATION: Check-out must be after Check-in
            if (start >= end) {
                setDateError('❌ Departure date must be AFTER Arrival date.');
                return;
            }

            // Calculate Days (Minimum 1 day)
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            // Determine Rate
            let rate = 300; // Base: Single Non-AC
            if (formData.roomType === 'Single' && formData.ac === 'true') rate = 400;
            if (formData.roomType === 'Double' && formData.ac === 'false') rate = 600;
            if (formData.roomType === 'Double' && formData.ac === 'true') rate = 800;

            // Total = Rate * Rooms * Days
            const total = rate * formData.roomsRequired * diffDays;
            setEstimatedPrice(total);
        };

        calculatePrice();
    }, [formData.arrivalDate, formData.departureDate, formData.roomType, formData.ac, formData.roomsRequired]);


    const fetchMyBookings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings/student/${student.id}`);
            setMyBookings(res.data);
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (dateError) {
            alert("Please fix the date errors before submitting.");
            return;
        }

        const data = new FormData();
        data.append('student', student.id);
        data.append('receipt', file);
        
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            await axios.post('http://localhost:5000/api/bookings', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('✅ Booking Request Submitted!');
            setActiveTab('history'); 
            fetchMyBookings();
        } catch (err) {
            alert('❌ Submission Failed');
            console.error(err);
        }
    };

    // Styles
    const containerStyle = { maxWidth: '800px', margin: '30px auto', padding: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.1)', borderRadius: '10px' };
    const tabBtnStyle = (isActive) => ({
        flex: 1, padding: '15px', border: 'none', cursor: 'pointer',
        backgroundColor: isActive ? '#007bff' : '#f8f9fa',
        color: isActive ? 'white' : 'black', fontWeight: 'bold'
    });
    const inputStyle = { width: '100%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
                <button style={tabBtnStyle(activeTab === 'new')} onClick={() => setActiveTab('new')}>📝 New Booking</button>
                <button style={tabBtnStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>🕒 My History</button>
            </div>

            {/* TAB 1: NEW BOOKING FORM */}
            {activeTab === 'new' && (
                <form onSubmit={handleSubmit}>
                    <h3 style={{ color: '#007bff' }}>Indenter Details (You)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input value={formData.indenterName} readOnly style={{...inputStyle, backgroundColor: '#e9ecef'}} />
                        <input value={formData.indenterDepartment} readOnly style={{...inputStyle, backgroundColor: '#e9ecef'}} />
                    </div>

                    <h3 style={{ color: '#007bff' }}>Guest Details</h3>
                    <input name="guestName" placeholder="Name of Guest" onChange={handleChange} required style={inputStyle} />
                    <input name="guestAddress" placeholder="Address & Contact Details" onChange={handleChange} required style={inputStyle} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input name="guestPhone" placeholder="Guest Mobile No" onChange={handleChange} required style={inputStyle} />
                        <input name="guestOccupation" placeholder="Designation / Occupation" onChange={handleChange} required style={inputStyle} />
                    </div>

                    <h3 style={{ color: '#007bff' }}>Room Preference</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Room Type</label>
                            <select name="roomType" onChange={handleChange} style={inputStyle}>
                                <option value="Single">Single Bed</option>
                                <option value="Double">Double Bed</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>AC Requirement</label>
                            <select name="ac" onChange={handleChange} style={inputStyle}>
                                <option value="false">Non-AC</option>
                                <option value="true">AC</option>
                            </select>
                        </div>
                    </div>

                    <h3 style={{ color: '#007bff' }}>Stay Details</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Arrival Date & Time</label>
                            <input type="datetime-local" name="arrivalDate" onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Departure Date & Time</label>
                            <input type="datetime-local" name="departureDate" onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    
                    {/* 🔴 DATE ERROR MESSAGE */}
                    {dateError && (
                        <div style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '5px', marginBottom: '15px', border: '1px solid #f5c6cb' }}>
                            {dateError}
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <label>Rooms Required</label>
                        <input 
                            type="number" 
                            value="1" 
                            readOnly 
                            style={{ ...inputStyle, backgroundColor: '#e9ecef', cursor: 'not-allowed' }} 
                            title="For multiple rooms, please submit separate requests."
                        />
                        <small style={{ color: 'red' }}>* Please submit separate requests for multiple rooms.</small>
                    </div>

                    <textarea name="purpose" placeholder="Purpose of Visit..." onChange={handleChange} required style={{ ...inputStyle, height: '60px' }}></textarea>

                    <h3 style={{ color: '#007bff' }}>Payment Proof</h3>
                    
                    {/* TOTAL PRICE DISPLAY */}
                    <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px', marginBottom: '15px', borderLeft: '5px solid #007bff' }}>
                        <h4 style={{ margin: 0, color: '#002147' }}>Estimated Total Cost: ₹ {estimatedPrice}</h4>
                        <small>Calculated based on Room Type x Rooms x Nights</small>
                    </div>

                    {/* 🔗 PAYMENT LINK BUTTON */}
                    <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #ffeeba' }}>
                        <p style={{ margin: '0 0 10px 0' }}>
                            ℹ️ <strong>Instruction:</strong> Please pay the charges via the VNIT Payment Portal.
                        </p>
                        <a 
                            href="https://pay.vnit.ac.in/home" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '10px 15px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}
                        >
                            🔗 Go to VNIT Payment Portal
                        </a>
                        <p style={{ marginTop: '10px', marginBottom: 0 }}>
                            Select "Other/Misc Fines" &rarr; "Hostel Guest Room Rent". Upload the receipt below.
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="number" name="amountPaid" placeholder="Amount Paid (₹)" onChange={handleChange} required style={inputStyle} />
                        <input type="text" name="challanNo" placeholder="Challan / Transaction No" onChange={handleChange} required style={inputStyle} />
                    </div>
                    <label style={{ fontWeight: 'bold' }}>Upload Receipt (PDF/Image):</label>
                    <input type="file" accept=".pdf, .jpg, .png" onChange={handleFileChange} required style={inputStyle} />

                    <button 
                        type="submit" 
                        disabled={!!dateError} // Disable if there is a date error
                        style={{ 
                            width: '100%', 
                            padding: '15px', 
                            backgroundColor: dateError ? '#ccc' : '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            fontSize: '1.1rem', 
                            cursor: dateError ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        Submit Request
                    </button>
                </form>
            )}

            {/* TAB 2: HISTORY */}
            {activeTab === 'history' && (
                <div>
                    <h3>My Past Bookings</h3>
                    {myBookings.length === 0 ? <p>No bookings yet.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Guest</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dates</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBookings.map(b => (
                                    <tr key={b._id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{b.guestName}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {new Date(b.arrivalDate).toLocaleDateString()} - {new Date(b.departureDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: b.status === 'Approved' ? 'green' : b.status === 'Rejected' ? 'red' : 'orange' }}>
                                            {b.status}
                                        </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {b.assignedRoom || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;