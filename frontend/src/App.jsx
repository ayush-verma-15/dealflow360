import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuotationPage from './pages/QuotationPage';
import QuotationDetailPage from './pages/QuotationDetailPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              icon: '✅',
              style: {
                background: '#10b981',
              },
            },
            error: {
              icon: '❌',
              style: {
                background: '#ef4444',
              },
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
          <Route path="/quotations/:id" element={<ProtectedRoute><QuotationDetailPage /></ProtectedRoute>} />
          
          {/* Customer Portal */}
          <Route path="/portal/:quoteId" element={<CustomerPortalPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          
          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
