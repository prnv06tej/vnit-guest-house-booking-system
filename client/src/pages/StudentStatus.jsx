import React, { useState } from 'react';
import axios from 'axios';

const StudentStatus = () => {
  const [email, setEmail] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Talk to the backend route we just created
      const res = await axios.get(`http://localhost:5000/api/bookings/student/${email}`);
      setMyBookings(res.data);
      if(res.data.length === 0) setError('No bookings found for this email.');
    } catch (err) {
      setError('Error fetching data. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Check Your Booking Status</h2>

      <form onSubmit={checkStatus} style={{ marginBottom: '20px' }}>
        <input 
          type="email" 
          placeholder="Enter your student email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', width: '70%', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'green', color: 'white' }}>
          Check
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {myBookings.length > 0 && (
        <table border="1" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Room Type</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {myBookings.map((booking) => (
              <tr key={booking._id}>
                <td style={{ padding: '10px' }}>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</td>
                <td style={{ padding: '10px' }}>{booking.roomType}</td>
                <td style={{ padding: '10px', fontWeight: 'bold', color: booking.status === 'Approved' ? 'green' : 'orange' }}>
                  {booking.status || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentStatus;