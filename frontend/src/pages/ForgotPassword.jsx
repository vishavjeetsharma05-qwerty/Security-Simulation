import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Key } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function ForgotPassword() {
  const { theme, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addNotification('Email address is required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      addNotification('Reset token generated. Paste it on the next screen.', 'success');
      setResetToken(res.data.resetToken);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Email not found.', 'error');
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
          <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
          <p className="text-xs opacity-70 mt-1">Request a password recovery token.</p>
        </div>

        {!resetToken ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="developer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all"
                />
                <Mail className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {loading ? 'Requesting...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-brand-indigo/30 text-xs flex flex-col items-center gap-2">
              <Key className="w-8 h-8 text-brand-indigo" />
              <span>Copy this reset code to use on the reset password screen:</span>
              <strong className="text-base tracking-widest text-brand-indigo select-all bg-black/30 px-4 py-1.5 rounded mt-1 font-mono">
                {resetToken}
              </strong>
            </div>

            <button
              onClick={() => navigate(`/reset-password?token=${resetToken}`)}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg active:scale-95 transition-all"
            >
              Proceed to Reset Password
            </button>
          </div>
        )}

        <div className="text-center mt-6 text-xs">
          <Link to="/login" className="text-brand-indigo dark:text-brand-rose hover:underline font-semibold">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
