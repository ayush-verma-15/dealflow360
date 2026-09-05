// frontend/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuotationPage from './pages/QuotationPage';
import AdminPage from './pages/AdminPage';
import CustomerPortalPage from './pages/CustomerPortalPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/quotations" element={<ProtectedRoute><QuotationPage /></ProtectedRoute>} />
            <Route path="/quotations/:id" element={<ProtectedRoute><QuotationPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            
            {/* Customer Portal */}
            <Route path="/portal/:quoteId" element={<CustomerPortalPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;