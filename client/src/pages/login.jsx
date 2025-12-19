import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // HARDCODED SECURITY FOR NOW
    if (email === 'admin@vnit.ac.in' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true'); // Save the "Key"
      alert('Login Successful!');
      navigate('/faculty'); // Go to dashboard
    } else {
      alert('Invalid Credentials!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Faculty Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: 'blue', color: 'white' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;