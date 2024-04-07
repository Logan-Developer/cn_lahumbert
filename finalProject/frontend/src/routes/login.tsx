import React, { useState } from 'react';
import axios from 'axios'; // Or your preferred HTTP client

axios.defaults.baseURL = 'http://localhost:3000';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/login', { username, password }, {
        headers: { 'Content-Type': 'application/json' }
      
      });

      // Successful login
      const token = response.data.token; 
      localStorage.setItem('jwtToken', token); 

      // Redirect the user to the protected area (e.g., dashboard)
      window.location.href = '/'; 

    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Login failed');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div> 
      <h2>Login</h2>
      {error && <p className="error">{error}</p>} 
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input 
            type="text" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
