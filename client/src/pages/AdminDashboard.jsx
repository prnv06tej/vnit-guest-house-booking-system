import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🌍 CONFIG: Load Backend URL
const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = ({ onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  // Selection States
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const navigate = useNavigate();

  // --- HELPER: SAFE DATE FORMATTER ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
  };

  // --- HELPER: SAFE FILE URL (PDF -> JPG) ---
  const getFileUrl = (path) => {
    if (!path) return "#";
    if (path.startsWith("http")) {
      return path.replace(".pdf", ".jpg"); 
    }
    const cleanPath = path.replace(/^uploads[\\/]/, "");
    return `${API_URL}/uploads/${cleanPath}`;
  };

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchPendingBookings();
    fetchRooms();
    fetchTodaysOccupancy();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/bookings/pending`);
      console.log("📢 Bookings Data:", res.data); 
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms", err);
    }
  };

  const fetchTodaysOccupancy = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const tomorrowDate = new Date(now);
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const tomorrow = tomorrowDate.toISOString().split("T")[0];

      if (!today || !tomorrow) return;

      const res = await axios.get(
        `${API_URL}/api/bookings/check-availability`,
        { params: { checkIn: today, checkOut: tomorrow } }
      );
      setOccupiedRooms(res.data.busyRooms || []);
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  };

  // 2. CONFLICT CHECK LOGIC
  const handleCheckAvailability = async (booking) => {
    // ✅ SCHEMA MAPPING: Use startDate / endDate
    const checkIn = booking.startDate;
    const checkOut = booking.endDate;

    if (!checkIn || !checkOut) {
      alert("This booking has invalid dates!");
      return;
    }

    setLoadingAvailability(true);
    setSelectedBookingId(booking._id);
    setSelectedRoom("");
    setAvailableRoomNumbers([]);

    try {
      const res = await axios.get(
        `${API_URL}/api/bookings/check-availability`,
        {
          params: { checkIn, checkOut }
        }
      );
      const freeNumbers = res.data.availableRooms.map((r) => r.roomNumber);
      setAvailableRoomNumbers(freeNumbers);
    } catch (err) {
      console.error(err);
      alert("Could not check room availability.");
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedBookingId || !selectedRoom) {
      alert("Please select a booking and a room first.");
      return;
    }
    try {
      // ✅ Sending 'assignedRoom' which the new controller now recognizes
      await axios.put(`${API_URL}/api/bookings/${selectedBookingId}/status`, {
        status: "approved", 
        assignedRoom: selectedRoom,
      });
      
      alert("Booking Approved & Room Allocated!");
      
      // Refresh data
      fetchPendingBookings();
      fetchTodaysOccupancy();
      
      // Reset selection
      setSelectedBookingId(null);
      setSelectedRoom("");
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Check console for details.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this request?")) return;
    try {
      await axios.put(`${API_URL}/api/bookings/${id}/status`, {
        status: "rejected", // ✅ LOWERCASE to match Schema Enum
      });
      fetchPendingBookings();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  // --- STYLES ---
  const thStyle = { padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" };
  const tdStyle = { padding: "12px", verticalAlign: "top" };
  const btnStyle = (bg, padding = "10px 15px") => ({
    backgroundColor: bg,
    color: "white",
    border: "none",
    padding: padding,
    borderRadius: "5px",
    cursor: "pointer",
  });
  const tabBtnStyle = (isActive) => ({
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    marginRight: "10px",
    borderRadius: "5px",
    backgroundColor: isActive ? "#002147" : "#e9ecef",
    color: isActive ? "white" : "black",
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: "#002147" }}>Admin Dashboard</h1>
        <div>
          <button onClick={() => setActiveTab("requests")} style={tabBtnStyle(activeTab === "requests")}>
            Pending Requests
          </button>
          <button onClick={() => { setActiveTab("status"); fetchTodaysOccupancy(); }} style={tabBtnStyle(activeTab === "status")}>
            Current Room Status
          </button>
          <button onClick={onLogout} style={{ ...btnStyle("#dc3545"), marginLeft: "20px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING REQUESTS */}
      {activeTab === "requests" && (
        <div>
          <h3>Pending Allocations</h3>
          {bookings.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
              <thead>
                <tr style={{ backgroundColor: "#002147", color: "white" }}>
                  <th style={thStyle}>Indenter</th>
                  <th style={thStyle}>Guest</th>
                  <th style={thStyle}>Preference</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: "1px solid #ddd" }}>
                    {/* ✅ FIXED: Use 'studentName' and 'department' */}
                    <td style={tdStyle}>
                      <strong>{b.studentName || "Unknown"}</strong>
                      <br />
                      <span style={{ color: "#666" }}>{b.department || "N/A"}</span>
                      <br />
                      <span style={{ fontSize: "0.8rem" }}>{b.studentPhone}</span>
                    </td>

                    {/* ✅ FIXED: Use 'startDate' and 'endDate' */}
                    <td style={tdStyle}>
                      {b.guestName}
                      <br />
                      <small>
                        In: {formatDate(b.startDate)}<br />
                        Out: {formatDate(b.endDate)}
                      </small>
                    </td>

                    <td style={tdStyle}>
                      {b.roomType} ({b.ac ? "AC" : "Non-AC"})<br />
                      {b.floorPref && <span style={{ fontSize: "0.8rem", color: "grey" }}>Pref: {b.floorPref} Floor</span>}
                      <br />
                      <span style={{ fontSize: "0.8rem", fontStyle: "italic" }}>Rs: {b.reason}</span>
                    </td>

                    {/* ✅ FIXED: Use 'totalPrice' */}
                    <td style={tdStyle}>
                      ₹{b.totalPrice || b.amountPaid} (Challan: {b.challanNo || "N/A"})<br />
                      <a href={getFileUrl(b.receiptUrl)} target="_blank" rel="noopener noreferrer" style={{ color: "blue" }}>View Receipt</a>
                    </td>

                    <td style={tdStyle}>
                      {selectedBookingId === b._id ? (
                        <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                          {loadingAvailability ? (
                            <span style={{ fontSize: "0.8rem" }}>Checking conflicts...</span>
                          ) : (
                            <>
                              <select onChange={(e) => setSelectedRoom(e.target.value)} style={{ padding: "5px" }}>
                                <option value="">Select Room</option>
                                {rooms
                                  .filter((r) => r.type === b.roomType && r.ac === (String(b.ac) === "true"))
                                  .filter((r) => availableRoomNumbers.includes(r.roomNumber))
                                  .map((r) => (<option key={r._id} value={r.roomNumber}>{r.roomNumber} ({r.floor} Flr)</option>))}
                              </select>
                              {availableRoomNumbers.length === 0 && <span style={{ color: "red", fontSize: "0.8rem" }}>No rooms available!</span>}
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button onClick={handleApprove} style={btnStyle("green", "5px")}>Confirm</button>
                                <button onClick={() => setSelectedBookingId(null)} style={btnStyle("grey", "5px")}>Cancel</button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button onClick={() => handleCheckAvailability(b)} style={btnStyle("#007bff", "5px")}>Allocate</button>
                          <button onClick={() => handleReject(b._id)} style={btnStyle("#dc3545", "5px")}>Reject</button>
                          
                          <button
                            onClick={async () => {
                              if (!window.confirm("Permanently DELETE this junk data?")) return;
                              try {
                                await axios.delete(`${API_URL}/api/bookings/${b._id}`);
                                fetchPendingBookings(); 
                              } catch (e) {
                                console.error(e);
                                alert("Delete failed.");
                              }
                            }}
                            style={{ backgroundColor: "black", color: "white", padding: "5px", marginLeft: "5px", cursor: "pointer", border: "none", borderRadius: "5px" }}
                          >
                            X
                          </button>
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

      {/* TAB 2: LIVE ROOM STATUS GRID */}
      {activeTab === "status" && (
        <div>
          <h3>Live Room Status (Today)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "15px", marginTop: "20px" }}>
            {rooms.map((room) => {
              const isOccupied = occupiedRooms.includes(room.roomNumber);
              return (
                <div key={room._id} style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px", textAlign: "center", backgroundColor: isOccupied ? "#f8d7da" : "#d4edda", color: isOccupied ? "#721c24" : "#155724", boxShadow: isOccupied ? "0 0 5px red" : "none" }}>
                  <strong style={{ fontSize: "1.2rem" }}>{room.roomNumber}</strong>
                  <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>{room.type}</div>
                  <div style={{ fontSize: "0.8rem" }}>{room.ac ? "AC" : "Non-AC"}</div>
                  <div style={{ fontWeight: "bold", marginTop: "5px", fontSize: "0.8rem" }}>{isOccupied ? "OCCUPIED" : "VACANT"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;