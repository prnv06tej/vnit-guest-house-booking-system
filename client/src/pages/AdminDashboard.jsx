import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onLogout }) => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]); // All Rooms
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'status'
    
    // Selection States
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState('');

    const navigate = useNavigate();

    // Load Data
    useEffect(() => {
        fetchPendingBookings();
        fetchRooms();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/bookings/pending');
            setBookings(res.data);
        } catch (err) { console.error("Error fetching bookings", err); }
    };

    const fetchRooms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rooms'); 
            setRooms(res.data);
        } catch (err) { console.error("Error fetching rooms", err); }
    };

    // --- LOGIC: CHECK IF ROOM IS OCCUPIED ---
    // In a real app, you check dates. For this project, we'll just check if a room is assigned.
    // Ideally, the backend should send "status: occupied" with the room list.
    // For now, let's assume all rooms are Free unless we see them in an "Approved" booking list.
    // (This part depends on how complex you want the availability logic to be).

    const handleApprove = async () => {
        if (!selectedBookingId || !selectedRoom) {
            alert('Please select a booking and a room first.');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/bookings/${selectedBookingId}/status`, {
                status: 'Approved',
                assignedRoom: selectedRoom
            });
            alert('Booking Approved & Room Allocated!');
            fetchPendingBookings(); 
            setSelectedBookingId(null);
            setSelectedRoom('');
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this request?")) return;
        try {
            await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: 'Rejected' });
            fetchPendingBookings();
        } catch (err) { alert('Failed to reject'); }
    };

    const getFileUrl = (path) => {
        if (!path) return '#';
        const cleanPath = path.replace(/^uploads[\\/]/, '');
        return `http://localhost:5000/uploads/${cleanPath}`;
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#002147' }}>Admin Dashboard</h1>
                <div>
                    <button onClick={() => setActiveTab('requests')} style={tabBtnStyle(activeTab === 'requests')}>Pending Requests</button>
                    <button onClick={() => setActiveTab('status')} style={tabBtnStyle(activeTab === 'status')}>Room Status</button>
                    <button onClick={onLogout} style={{ ...btnStyle('#dc3545'), marginLeft: '20px' }}>Logout</button>
                </div>
            </div>

            {/* TAB 1: PENDING REQUESTS */}
            {activeTab === 'requests' && (
                <div>
                    <h3>Pending Allocations</h3>
                    {bookings.length === 0 ? <p>No pending requests.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#002147', color: 'white' }}>
                                    <th style={thStyle}>Indenter</th>
                                    <th style={thStyle}>Guest</th>
                                    <th style={thStyle}>Preference</th>
                                    <th style={thStyle}>Payment</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b._id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={tdStyle}>{b.indenterName}<br/>{b.indenterDepartment}</td>
                                        <td style={tdStyle}>{b.guestName}<br/>In: {new Date(b.arrivalDate).toLocaleDateString()}</td>
                                        <td style={tdStyle}>{b.roomType} ({b.ac ? 'AC' : 'Non-AC'})</td>
                                        <td style={tdStyle}>
                                            ₹{b.amountPaid} (Challan: {b.challanNo})<br/>
                                            <a href={getFileUrl(b.receiptPath)} target="_blank" rel="noopener noreferrer" style={{color:'blue'}}>View Receipt</a>
                                        </td>
                                        <td style={tdStyle}>
                                            {selectedBookingId === b._id ? (
                                                <div style={{display:'flex', gap:'5px'}}>
                                                    <select onChange={(e) => setSelectedRoom(e.target.value)} style={{padding:'5px'}}>
                                                        <option value="">Select Room</option>
                                                        {rooms
                                                            .filter(r => r.type === b.roomType && r.ac === b.ac) // Filter by Preference
                                                            .map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber}</option>)
                                                        }
                                                    </select>
                                                    <button onClick={handleApprove} style={btnStyle('green', '5px')}>OK</button>
                                                </div>
                                            ) : (
                                                <div style={{display:'flex', gap:'5px'}}>
                                                    <button onClick={() => setSelectedBookingId(b._id)} style={btnStyle('#007bff', '5px')}>Allocate</button>
                                                    <button onClick={() => handleReject(b._id)} style={btnStyle('#dc3545', '5px')}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB 2: ROOM STATUS GRID */}
            {activeTab === 'status' && (
                <div>
                    <h3>Room Availability (Total: {rooms.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
                        {rooms.map(room => (
                            <div key={room._id} style={{
                                padding: '15px',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                textAlign: 'center',
                                backgroundColor: '#d4edda', // Green by default (Free)
                                color: '#155724'
                            }}>
                                <strong style={{ fontSize: '1.2rem' }}>{room.roomNumber}</strong>
                                <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>{room.type}</div>
                                <div style={{ fontSize: '0.8rem' }}>{room.ac ? 'AC' : 'Non-AC'}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                        * Currently showing Inventory. To show "Occupied" (Red), we need to fetch active bookings and compare Room Numbers.
                    </p>
                </div>
            )}
        </div>
    );
};

const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px', verticalAlign: 'top' };
const btnStyle = (bg, padding = '10px 15px') => ({ backgroundColor: bg, color: 'white', border: 'none', padding: padding, borderRadius: '5px', cursor: 'pointer' });
const tabBtnStyle = (isActive) => ({
    padding: '10px 20px', cursor: 'pointer', border: 'none', marginRight: '10px', borderRadius: '5px',
    backgroundColor: isActive ? '#002147' : '#e9ecef', color: isActive ? 'white' : 'black'
});

export default AdminDashboard;