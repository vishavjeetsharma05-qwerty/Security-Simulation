import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, Key, Lock } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function ResetPassword() {
  const { theme, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) {
      addNotification('Token and new password are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      addNotification('Password reset successful. Please sign in.', 'success');
      navigate('/login');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bgUrl = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: theme === 'dark' ? 'blur(8px) brightness(0.25)' : 'blur(8px) brightness(0.95)'
        }}
      />

      <div className={`relative z-10 w-full max-w-md p-8 rounded-2xl border shadow-2xl transition-all duration-300 ${
        theme === 'dark' ? 'glass-card text-slate-100' : 'glass-card-light text-slate-800'
      }`}>
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-tr from-brand-rose to-brand-indigo text-white shadow-lg mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
          <p className="text-xs opacity-70 mt-1">Enter your token and set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Reset Token</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-mono"
              />
              <Key className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all"
              />
              <Lock className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs">
          <Link to="/login" className="text-brand-indigo dark:text-brand-rose hover:underline font-semibold">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
