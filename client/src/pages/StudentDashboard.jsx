import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 🌍 CONFIG: Load the backend URL from .env file
const API_URL = import.meta.env.VITE_API_URL;

const StudentDashboard = ({ setAuth }) => {
    // UI State
    const [activeTab, setActiveTab] = useState('new');
    const [myBookings, setMyBookings] = useState([]);

    // Logic State
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    const [dateError, setDateError] = useState('');

    // Availability State (New Feature)
    const [availabilityStats, setAvailabilityStats] = useState(null);
    const [checkingAvail, setCheckingAvail] = useState(false);

    const navigate = useNavigate();

    // 👤 AUTH: Get logged-in student from Browser Storage
    const [student, setStudent] = useState(JSON.parse(localStorage.getItem('student')));

    // Form States
    const [profileEdit, setProfileEdit] = useState(false);
    const [profileData, setProfileData] = useState({ phone: '', department: '' });
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });

    const [formData, setFormData] = useState({
        indenterName: '', indenterDesignation: 'Student', indenterDepartment: '', indenterPhone: '',
        guestName: '', guestAddress: '', guestPhone: '', guestOccupation: '',
        roomsRequired: 1, arrivalDate: '', departureDate: '', purpose: '',
        roomType: 'Single', ac: 'false', amountPaid: '', challanNo: '',
        floorPref: 'Any', aadhar1: '', aadhar2: '' 
    });
    const [file, setFile] = useState(null); 

    // --- HELPER: FORMAT DATE (Fixes "Invalid Date") ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    };

    // --- HELPER: FILE URL (Fixes PDF Viewer) ---
    const getFileUrl = (path) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path.replace('.pdf', '.jpg');
        return `${API_URL}/uploads/${path.replace(/^uploads[\\/]/, '')}`;
    };

    // -------------------------------------------------------
    // 1. INITIALIZATION CHECK
    // -------------------------------------------------------
    useEffect(() => {
        if (!student) {
            if (setAuth) setAuth(false); 
            navigate('/student-login');
            return;
        }

        setFormData(prev => ({
            ...prev,
            indenterName: student.name,
            indenterDepartment: student.department,
            indenterPhone: student.phone
        }));
        setProfileData({ phone: student.phone, department: student.department });

        fetchMyBookings(); 
    }, [student]);

    // -------------------------------------------------------
    // 2. REAL-TIME CALCULATIONS 
    // -------------------------------------------------------
    useEffect(() => {
        setDateError(''); setEstimatedPrice(0); setAvailabilityStats(null);

        if (!formData.arrivalDate || !formData.departureDate) return;

        const start = new Date(formData.arrivalDate);
        const end = new Date(formData.departureDate);
        const now = new Date();

        if (start < now.setHours(0, 0, 0, 0)) { setDateError('❌ Arrival cannot be in past.'); return; }
        if (start >= end) { setDateError('❌ Departure must be AFTER Arrival.'); return; }

        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
        let rate = 300;
        if (formData.roomType === 'Single' && formData.ac === 'true') rate = 400;
        if (formData.roomType === 'Double' && formData.ac === 'false') rate = 600;
        if (formData.roomType === 'Double' && formData.ac === 'true') rate = 800;

        setEstimatedPrice(rate * formData.roomsRequired * diffDays);
        checkAvailability(formData.arrivalDate, formData.departureDate);

    }, [formData.arrivalDate, formData.departureDate, formData.roomType, formData.ac]);

    // -------------------------------------------------------
    // 3. API ACTIONS
    // -------------------------------------------------------

    const checkAvailability = async (start, end) => {
        setCheckingAvail(true);
        try {
            const res = await axios.get(`${API_URL}/api/bookings/check-availability?checkIn=${start}&checkOut=${end}`);
            setAvailabilityStats(res.data);
        } catch (err) {
            console.error("Avail Check Failed");
        } finally {
            setCheckingAvail(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/bookings/student/${student._id || student.id}`);
            setMyBookings(res.data);
        } catch (err) { console.error(err); }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (dateError) { alert("Fix date errors."); return; }

        const data = new FormData();
        data.append('student', student._id || student.id);
        
        // ✅ CRITICAL FIX: Send the email so the backend knows where to send the confirmation
        data.append('studentEmail', student.email); 
        
        data.append('receipt', file); 

        // Loop through all text fields and add them
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            await axios.post(`${API_URL}/api/bookings/create`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('✅ Request Submitted! Check your email.'); // Updated alert
            setActiveTab('history');
            fetchMyBookings();
        } catch (err) {
            console.error("Booking Error:", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            alert('❌ Failed: ' + errMsg);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await axios.put(`${API_URL}/api/auth/profile/${student._id || student.id}`, profileData);
            alert('Profile Updated!');
            const updatedStudent = { ...student, ...res.data };
            localStorage.setItem('student', JSON.stringify(updatedStudent));
            setStudent(updatedStudent);
            setProfileEdit(false);
        } catch (err) { alert('Update failed'); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/change-password`, {
                studentId: student._id || student.id,
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            alert('Password Changed! Please login again.');
            if (setAuth) setAuth(false);
            localStorage.clear();
            navigate('/student-login');
        } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    };

    // ... (Styles) ...
    const containerStyle = { maxWidth: '800px', margin: '30px auto', padding: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.1)', borderRadius: '10px' };
    const tabBtnStyle = (isActive) => ({ flex: 1, padding: '15px', border: 'none', cursor: 'pointer', backgroundColor: isActive ? '#007bff' : '#f8f9fa', color: isActive ? 'white' : 'black', fontWeight: 'bold' });
    const inputStyle = { width: '100%', padding: '8px', margin: '5px 0 15px', border: '1px solid #ccc', borderRadius: '4px' };

    return (
        <div style={containerStyle}>
            {/* Header Tabs */}
            <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
                <button style={tabBtnStyle(activeTab === 'new')} onClick={() => setActiveTab('new')}>📝 New Booking</button>
                <button style={tabBtnStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>🕒 History</button>
                <button style={tabBtnStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>👤 Profile</button>
            </div>

            {/* TAB 1: NEW BOOKING FORM */}
            {activeTab === 'new' && (
                <form onSubmit={handleBookingSubmit}>
                    <h3>Indenter (You)</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input value={formData.indenterName} readOnly style={{ ...inputStyle, backgroundColor: '#e9ecef' }} />
                        <input value={formData.indenterDepartment} readOnly style={{ ...inputStyle, backgroundColor: '#e9ecef' }} />
                    </div>

                    <h3>Guest Details</h3>
                    <input placeholder="Guest Name" name="guestName" onChange={e => setFormData({ ...formData, guestName: e.target.value })} required style={inputStyle} />
                    <input placeholder="Address" name="guestAddress" onChange={e => setFormData({ ...formData, guestAddress: e.target.value })} required style={inputStyle} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Mobile" name="guestPhone" onChange={e => setFormData({ ...formData, guestPhone: e.target.value })} required style={inputStyle} />
                        <input placeholder="Occupation" name="guestOccupation" onChange={e => setFormData({ ...formData, guestOccupation: e.target.value })} required style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Guest 1 Aadhar No." name="aadhar1" onChange={e => setFormData({ ...formData, aadhar1: e.target.value })} required style={inputStyle} />
                        {formData.roomType === 'Double' && (
                            <input placeholder="Guest 2 Aadhar No." name="aadhar2" onChange={e => setFormData({ ...formData, aadhar2: e.target.value })} required style={inputStyle} />
                        )}
                    </div>

                    <h3>Stay & Room</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select name="roomType" onChange={e => setFormData({ ...formData, roomType: e.target.value })} style={inputStyle}><option value="Single">Single</option><option value="Double">Double</option></select>
                        <select name="ac" onChange={e => setFormData({ ...formData, ac: e.target.value })} style={inputStyle}><option value="false">Non-AC</option><option value="true">AC</option></select>
                        <select name="floorPref" onChange={e => setFormData({ ...formData, floorPref: e.target.value })} style={inputStyle}>
                            <option value="Any">Any Floor</option>
                            <option value="Ground">Ground Floor</option>
                            <option value="1st">1st Floor</option>
                            <option value="2nd">2nd Floor</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="datetime-local" name="arrivalDate" onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })} required style={inputStyle} />
                        <input type="datetime-local" name="departureDate" onChange={e => setFormData({ ...formData, departureDate: e.target.value })} required style={inputStyle} />
                    </div>
                    {dateError && <div style={{ color: 'red', marginBottom: '10px' }}>{dateError}</div>}

                    {/* AVAILABILITY CHART */}
                    {formData.arrivalDate && formData.departureDate && !dateError && (
                        <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px', backgroundColor: checkingAvail ? '#f8f9fa' : (availabilityStats?.totalAvailable > 0 ? '#d4edda' : '#f8d7da'), border: '1px solid #ccc' }}>
                            {checkingAvail ? <span>🔄 Checking Room Availability...</span> : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>Status for {formData.roomType} ({formData.ac === 'true' ? 'AC' : 'Non-AC'}):</strong>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            ✅ Available: {
                                                availabilityStats?.availableRooms.filter(r =>
                                                    r.type === formData.roomType &&
                                                    r.ac === (formData.ac === 'true')
                                                ).length || 0
                                            } Rooms
                                            <br />
                                            ❌ Total Hotel Occupancy: {availabilityStats?.busyRooms?.length || 0} Rooms
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem' }}>
                                        {availabilityStats?.availableRooms.filter(r =>
                                            r.type === formData.roomType &&
                                            r.ac === (formData.ac === 'true')
                                        ).length > 0 ? '🟢' : '🔴'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <h3>Payment (Est: ₹{estimatedPrice})</h3>
                    <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #ffeeba' }}>
                        <p style={{ margin: '0 0 10px 0' }}>ℹ️ <strong>Instruction:</strong> Please pay the charges via the VNIT Payment Portal.</p>
                        <a href="https://vnit.ac.in/payment" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>🔗 Go to VNIT Payment Portal</a>
                        <p style={{ marginTop: '10px', marginBottom: 0 }}>Select "Other/Misc Fines" &rarr; "Hostel Guest Room Rent". Upload the receipt below.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="Amount Paid" name="amountPaid" type="number" onChange={e => setFormData({ ...formData, amountPaid: e.target.value })} required style={inputStyle} />
                        <input placeholder="Challan No" name="challanNo" onChange={e => setFormData({ ...formData, challanNo: e.target.value })} required style={inputStyle} />
                    </div>
                    <label style={{ fontWeight: 'bold' }}>Upload Receipt (PDF/Image):</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} required style={inputStyle} />
                    <textarea placeholder="Purpose" name="purpose" onChange={e => setFormData({ ...formData, purpose: e.target.value })} required style={inputStyle}></textarea>

                    <button type="submit" disabled={!!dateError} style={{ width: '100%', padding: '15px', backgroundColor: dateError ? '#ccc' : 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: dateError ? 'not-allowed' : 'pointer' }}>Submit Request</button>
                </form>
            )}

            {/* TAB 2: HISTORY (FIXED) */}
            {activeTab === 'history' && (
                <div>
                    <h3>Booking History</h3>
                    {myBookings.length === 0 ? <p>No bookings found.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#eee' }}>
                                    <th style={{ padding: '10px' }}>Guest</th>
                                    <th style={{ padding: '10px' }}>Dates</th>
                                    <th style={{ padding: '10px' }}>Room & Status</th>
                                    <th style={{ padding: '10px' }}>Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myBookings.map(b => (
                                    <tr key={b._id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '10px' }}>
                                            <strong>{b.guestName}</strong><br/>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{b.reason}</span>
                                        </td>
                                        
                                        {/* ✅ FIXED: Use 'startDate' instead of 'arrivalDate' */}
                                        <td style={{ padding: '10px' }}>
                                            In: {formatDate(b.startDate)}<br/>
                                            Out: {formatDate(b.endDate)}
                                        </td>

                                        {/* ✅ FIXED: Show Status + Allocated Room */}
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: b.status === 'approved' ? 'green' : b.status === 'rejected' ? 'red' : 'orange', textTransform: 'capitalize' }}>
                                                {b.status}
                                            </span>
                                            <br/>
                                            {b.status === 'approved' && b.assignedRoomNumber ? (
                                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #000', padding: '2px 4px', borderRadius: '3px' }}>
                                                    Room: {b.assignedRoomNumber}
                                                </span>
                                            ) : null}
                                        </td>

                                        <td style={{ padding: '10px' }}>
                                             {/* ✅ FIXED: Use safe file URL */}
                                             <a href={getFileUrl(b.receiptUrl)} target="_blank" rel="noopener noreferrer" style={{color: 'blue'}}>View</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* TAB 3: PROFILE */}
            {activeTab === 'profile' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>My Profile</h3>
                        <button onClick={() => setProfileEdit(!profileEdit)} style={{ background: profileEdit ? 'grey' : '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>{profileEdit ? 'Cancel Edit' : 'Edit Details'}</button>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <p><strong>Name:</strong> {student.name}</p>
                        <p><strong>Student ID:</strong> {student.studentId}</p>
                        <p><strong>Email:</strong> {student.email}</p>
                        <div style={{ marginTop: '15px' }}>
                            <label><strong>Department:</strong></label>
                            <input value={profileEdit ? profileData.department : student.department} onChange={e => setProfileData({ ...profileData, department: e.target.value })} disabled={!profileEdit} style={{ ...inputStyle, background: profileEdit ? 'white' : 'transparent', border: profileEdit ? '1px solid #ccc' : 'none' }} />
                        </div>
                        <div>
                            <label><strong>Phone:</strong></label>
                            <input value={profileEdit ? profileData.phone : student.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} disabled={!profileEdit} style={{ ...inputStyle, background: profileEdit ? 'white' : 'transparent', border: profileEdit ? '1px solid #ccc' : 'none' }} />
                        </div>
                        {profileEdit && <button onClick={handleUpdateProfile} style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>Save Changes</button>}
                    </div>

                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword} style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
                        <input type="password" placeholder="Current Password" onChange={e => setPassData({ ...passData, oldPassword: e.target.value })} required style={inputStyle} />
                        <input type="password" placeholder="New Password" onChange={e => setPassData({ ...passData, newPassword: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={{ background: '#ffc107', color: 'black', border: 'none', padding: '10px', width: '100%', cursor: 'pointer', fontWeight: 'bold' }}>Update Password</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;