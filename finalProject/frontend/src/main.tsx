import React from 'react'
import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './routes/login';
import Dashboard from './routes/dashboard';
import { createRoot } from 'react-dom/client';
import Register from './routes/register';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

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

const LoginRegiserRedirect = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginRegiserRedirect>
              <Login />
            </LoginRegiserRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <LoginRegiserRedirect>
              <Register />
            </LoginRegiserRedirect>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}