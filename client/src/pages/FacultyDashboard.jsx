import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null); // Which booking are we trying to approve?
    const [availableRooms, setAvailableRooms] = useState([]); // List of free rooms (G01, G02...)
    const [chosenRoom, setChosenRoom] = useState(''); // The room selected in dropdown

    const fetchPendingBookings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/bookings/pending');
            setBookings(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    useEffect(() => {
        fetchPendingBookings();
        const interval = setInterval(fetchPendingBookings, 5000);
        return () => clearInterval(interval);
    }, []);

    // 1. When "Approve" is clicked -> Fetch Available Rooms first
    const handleApproveClick = async (booking) => {
        try {
            setSelectedBooking(booking._id); // Show dropdown for this row
            setAvailableRooms([]); // Clear old list
            setChosenRoom('');

            // Ask Backend: "What is free for these dates?"
            const response = await axios.get('http://localhost:5000/api/bookings/available', {
                params: {
                    roomType: booking.roomType,
                    ac: booking.ac,
                    startDate: booking.startDate,
                    endDate: booking.endDate
                }
            });
            setAvailableRooms(response.data); // e.g., [{roomNumber: 'G01'}, {roomNumber: 'G05'}]
        } catch (error) {
            alert("Error checking room availability");
        }
    };

    // 2. When "Confirm" is clicked -> Save to DB
    const confirmAssignment = async () => {
        if (!chosenRoom) return alert("Please select a room first!");
        
        try {
            await axios.put(`http://localhost:5000/api/bookings/assign/${selectedBooking}`, {
                roomNumber: chosenRoom
            });
            
            // Reset UI
            setSelectedBooking(null);
            fetchPendingBookings();
            alert(`Room ${chosenRoom} assigned successfully!`);
        } catch (error) {
            alert("Failed to assign room.");
        }
    };

    // 3. Simple Reject (No room needed)
    const handleReject = async (id) => {
        if(!window.confirm("Are you sure you want to reject?")) return;
        try {
            await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: 'rejected' });
            fetchPendingBookings();
        } catch (error) {
            alert("Failed to reject");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Faculty Dashboard (Room Assignment)</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white', textAlign: 'left' }}>
                            <th style={thStyle}>Student</th>
                            <th style={thStyle}>Request Info</th>
                            <th style={thStyle}>Dates</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id} style={{ borderBottom: '1px solid #ddd', backgroundColor: selectedBooking === b._id ? '#f1f9ff' : 'white' }}>
                                <td style={tdStyle}>
                                    <strong>{b.studentName}</strong><br/>
                                    {b.enrollmentId}
                                </td>
                                <td style={tdStyle}>
                                    {b.roomType} ({b.ac ? 'AC' : 'Non-AC'}) <br/>
                                    <span style={{color: '#666', fontStyle: 'italic'}}>"{b.reason}"</span>
                                </td>
                                <td style={tdStyle}>
                                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                </td>
                                <td style={tdStyle}>
                                    {selectedBooking === b._id ? (
                                        // --- SELECTION MODE ---
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <select 
                                                value={chosenRoom} 
                                                onChange={(e) => setChosenRoom(e.target.value)}
                                                style={{ padding: '5px' }}
                                            >
                                                <option value="">Select Room...</option>
                                                {availableRooms.map(r => (
                                                    <option key={r._id} value={r.roomNumber}>{r.roomNumber}</option>
                                                ))}
                                            </select>
                                            <button onClick={confirmAssignment} style={{...btnStyle, backgroundColor: '#28a745'}}>Confirm</button>
                                            <button onClick={() => setSelectedBooking(null)} style={{...btnStyle, backgroundColor: '#6c757d'}}>Cancel</button>
                                        </div>
                                    ) : (
                                        // --- NORMAL MODE ---
                                        <div>
                                            <button onClick={() => handleApproveClick(b)} style={{...btnStyle, backgroundColor: '#007bff'}}>
                                                ✓ Approve
                                            </button>
                                            <button onClick={() => handleReject(b._id)} style={{...btnStyle, backgroundColor: '#dc3545', marginLeft: '5px'}}>
                                                ✕ Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && <p style={{textAlign:'center', marginTop:'20px'}}>No pending requests.</p>}
            </div>
        </div>
    );
};

const thStyle = { padding: '12px', border: '1px solid #ddd' };
const tdStyle = { padding: '10px', border: '1px solid #ddd', verticalAlign: 'middle' };
const btnStyle = { padding: '6px 12px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default FacultyDashboard;