import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // THE FIX: Explicitly pointing to localhost:5000
    axios.get('http://localhost:5000/api/bookings')
      .then(res => {
        setBookings(res.data);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load bookings. Is the backend running?');
      });
  }, []);

  return (
    <div>
      <h2>Faculty Dashboard</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {bookings.length === 0 && !error ? (
        <p>No bookings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Student Email</th>
              <th>Room Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.studentEmail || booking.email}</td>
                <td>{booking.roomType}</td>
                <td style={{ 
                  color: booking.status === 'Approved' ? 'green' : 'orange', 
                  fontWeight: 'bold' 
                }}>
                  {booking.status || 'Pending'}
                </td>
                <td>
                  <button style={{ padding: '5px 10px', fontSize: '14px' }}>
                    View
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