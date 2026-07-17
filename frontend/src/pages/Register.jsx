import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function Register() {
  const { register, user } = useContext(AuthContext);
  const { theme, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [registeredToken, setRegisteredToken] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    const tempErrors = {};
    if (!name) tempErrors.name = 'Full Name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email';
    if (!phone) tempErrors.phone = 'Phone number is required';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await register(name, email, password, phone);
      addNotification('Account created! Email verification token generated.', 'success');
      setRegisteredToken(data.verificationToken);
      setShowVerify(true);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      addNotification('Verification code is required.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-email', { token: verificationCode });
      addNotification('Email verified successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Invalid verification token.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bgUrl = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=80';

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
          <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-xs opacity-70 mt-1">Start your Security Simulation journey today.</p>
        </div>

        {!showVerify ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Vraj Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                  }`}
                />
                <User className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
              </div>
              {errors.name && <span className="text-[11px] text-rose-500 mt-1 block">{errors.name}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="developer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                  }`}
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
              </div>
              {errors.email && <span className="text-[11px] text-rose-500 mt-1 block">{errors.email}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                  }`}
                />
                <Phone className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
              </div>
              {errors.phone && <span className="text-[11px] text-rose-500 mt-1 block">{errors.phone}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                  }`}
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
              </div>
              {errors.password && <span className="text-[11px] text-rose-500 mt-1 block">{errors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-brand-indigo/30 text-xs text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-brand-indigo" />
              <span>We simulated sending a verification email. Copy the code below to complete registration:</span>
              <strong className="text-sm tracking-widest text-brand-indigo mt-1 select-all bg-black/30 px-3 py-1 rounded">
                {registeredToken}
              </strong>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Verification Code</label>
              <input
                type="text"
                placeholder="Enter verification token"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all text-center tracking-widest font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-xs">
          <span className="opacity-70">Already have an account? </span>
          <Link to="/login" className="text-brand-indigo dark:text-brand-rose hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
