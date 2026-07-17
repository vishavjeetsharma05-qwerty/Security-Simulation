import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import RedTeam from './pages/RedTeam';
import BlueTeam from './pages/BlueTeam';
import SecurityTool from './pages/SecurityTool';
import Reports from './pages/Reports';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading session details...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Checking authorizations...</span>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function NavigationRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/red-team" element={<ProtectedRoute><RedTeam /></ProtectedRoute>} />
      <Route path="/blue-team" element={<ProtectedRoute><BlueTeam /></ProtectedRoute>} />
      <Route path="/security-tool" element={<ProtectedRoute><SecurityTool /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <Admin />
          </AdminRoute>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <NavigationRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
