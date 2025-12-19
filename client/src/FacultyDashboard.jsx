import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyDashboard = () => {
    // 1. State: Where we store the data
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. Effect: Run this when the page loads
    useEffect(() => {
        fetchPendingBookings();
    }, []);

    // 3. Logic: Get data from Backend
    const fetchPendingBookings = async () => {
        try {
            // "axios" acts like a browser requesting a URL
            const response = await axios.get('http://localhost:5000/api/bookings/pending');
            setBookings(response.data); // Save the data to State
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load bookings. Is the backend running?");
            setLoading(false);
        }
    };

    // 4. Logic: Handle Buttons (We will implement logic later)
    const handleAction = (id, status) => {
        alert(`You clicked ${status} for Booking ID: ${id}`);
    };

    // 5. Render: The HTML the user sees
    if (loading) return <p>Loading requests...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Pending Approvals</h2>
            
            {bookings.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Room Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking._id}>
                                <td>{booking.studentName}</td>
                                <td>{booking.roomType}</td>
                                <td>{booking.status}</td>
                                <td>
                                    <button 
                                        onClick={() => handleAction(booking._id, 'approved')}
                                        style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        onClick={() => handleAction(booking._id, 'rejected')}
                                        style={{ backgroundColor: 'red', color: 'white' }}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FacultyDashboard;