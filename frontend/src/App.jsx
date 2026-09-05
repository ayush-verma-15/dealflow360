import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuotationPage from './pages/QuotationPage';
import QuotationDetailPage from './pages/QuotationDetailPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import CustomerPortalHome from './pages/CustomerPortalHome';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import WorkspaceInfoPage from './pages/WorkspaceInfoPage';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute internalOnly><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute internalOnly><DashboardPage /></ProtectedRoute>} />
              <Route path="/quotations" element={<ProtectedRoute internalOnly><QuotationPage /></ProtectedRoute>} />
              <Route path="/quotations/:id" element={<ProtectedRoute internalOnly><QuotationDetailPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute internalOnly><ReportsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute internalOnly><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><WorkspaceInfoPage /></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute><WorkspaceInfoPage /></ProtectedRoute>} />
              <Route path="/features" element={<ProtectedRoute><WorkspaceInfoPage /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute internalOnly><BillingPage /></ProtectedRoute>} />
              <Route path="/portal" element={<ProtectedRoute customerOnly><CustomerPortalHome /></ProtectedRoute>} />
              <Route path="/portal/:quoteId" element={<ProtectedRoute customerOnly><CustomerPortalPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
