import React from 'react'
import './index.css'
import { render } from 'react-dom';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './routes/login';
import Dashboard from './routes/dashboard';
import { createRoot } from 'react-dom/client';
import Register from './routes/register';

const isAuthenticated = () => {
  // Logic to check if a valid JWT token exists
  const token = localStorage.getItem('jwtToken');
  // Add validation logic for the token if needed
  return !!token; 
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />; 
  }
  return children;
};

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}