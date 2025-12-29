import React from 'react';
import { Link } from 'react-router-dom';
import vnitBg from '../assets/vnit_bg.jpg'; // Ensure you have this image in assets!

const Home = () => {
    
    // Function to scroll down smoothly
    const scrollToContent = () => {
        document.getElementById('content-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div style={styles.container}>
            
            {/* 1️⃣ HERO SECTION (Full Height with Background Image) */}
            <div style={styles.hero}>
                <div style={styles.overlay}>
                    <h1 style={styles.title}>Welcome to VNIT Guest House</h1>
                    <p style={styles.subtitle}>
                        Experience comfort and hospitality in the heart of the campus.
                    </p>
                    
                    {/* Scroll Down Button */}
                    <button onClick={scrollToContent} style={styles.scrollBtn}>
                        ⬇ Proceed to Login
                    </button>
                </div>
            </div>

            {/* 2️⃣ CONTENT SECTION (Visible on Scroll) */}
            <div id="content-section" style={styles.section}>
                
                {/* NEW PORTAL BUTTONS */}
                <h2 style={styles.sectionTitle}>Select Your Portal</h2>
                <div style={styles.portalContainer}>
                    <Link to="/student-login" style={styles.portalBtn}>
                        <span style={{fontSize: '2rem'}}>🎓</span>
                        <div>
                            <strong>Student Portal</strong>
                            <div style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Book Rooms & Check Status</div>
                        </div>
                    </Link>

                    <Link to="/admin" style={{...styles.portalBtn, backgroundColor: '#002147'}}>
                        <span style={{fontSize: '2rem'}}>🔐</span>
                        <div>
                            <strong>Admin Portal</strong>
                            <div style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Faculty & Staff Login</div>
                        </div>
                    </Link>
                </div>

                {/* ORIGINAL ABOUT SECTION */}
                <hr style={{margin: '50px 0', border: '0', borderTop: '1px solid #ddd'}} />

                <h2 style={styles.sectionTitle}>About Us</h2>
                <p style={styles.text}>
                    The Visvesvaraya National Institute of Technology (VNIT) Guest House provides excellent accommodation facilities for institute guests, visiting faculty, and parents of students.
                </p>

                <div style={styles.features}>
                    <div style={styles.card}>
                        <h3>🛏️ Comfortable Rooms</h3>
                        <p>Well-furnished AC and Non-AC rooms available for Single and Double occupancy.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>📶 Wi-Fi Enabled</h3>
                        <p>High-speed internet access available throughout the guest house premises.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>🍽️ Dining Facility</h3>
                        <p>In-house canteen serving hygienic and delicious meals for guests.</p>
                    </div>
                </div>
            </div>

            {/* FOOTER INSTRUCTION */}
            <div style={{backgroundColor: '#002147', color: 'white', padding: '20px', textAlign: 'center'}}>
                <p style={{margin: 0}}>Need Help? Contact VNIT Administration at admin@vnit.ac.in</p>
            </div>
        </div>
    );
};

// --- STYLES ---
const styles = {
    container: { fontFamily: "'Segoe UI', sans-serif" },
    
    // HERO STYLES (Your Original Look)
    hero: {
        backgroundImage: `url(${vnitBg})`, 
        height: '100vh', // Full Screen
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
    },
    title: { fontSize: '3.5rem', marginBottom: '10px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
    subtitle: { fontSize: '1.5rem', marginBottom: '40px', fontWeight: '300', maxWidth: '800px' },
    
    scrollBtn: {
        padding: '12px 30px',
        backgroundColor: 'transparent',
        border: '2px solid white',
        color: 'white',
        fontSize: '1.2rem',
        borderRadius: '30px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontWeight: 'bold'
    },

    // CONTENT SECTION STYLES
    section: { padding: '80px 20px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' },
    sectionTitle: { fontSize: '2.5rem', color: '#2c3e50', marginBottom: '30px' },
    
    // PORTAL BUTTONS
    portalContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        flexWrap: 'wrap',
        marginBottom: '20px'
    },
    portalBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        backgroundColor: '#f39c12',
        color: 'white',
        padding: '20px 30px',
        borderRadius: '10px',
        textDecoration: 'none',
        width: '300px',
        fontSize: '1.3rem',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s'
    },

    // ABOUT TEXT & CARDS
    text: { fontSize: '1.1rem', color: '#555', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 40px' },
    features: { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
    card: { flex: '1', minWidth: '250px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: 'white' }
};

export default Home;