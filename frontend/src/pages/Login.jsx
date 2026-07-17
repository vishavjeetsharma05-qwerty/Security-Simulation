import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const { theme, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(false);
    try {
      setLoading(true);
      await login(email, password, rememberMe);
      addNotification('Welcome back! Login successful.', 'success');
      navigate('/');
    } catch (error) {
      addNotification(error.response?.data?.message || 'Login failed. Please check credentials.', 'error');
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
          <h2 className="text-2xl font-bold tracking-tight">Security Simulation</h2>
          <p className="text-xs opacity-70 mt-1">Attack, Defend, Secure. Enter credentials to log in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                }`}
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 opacity-50" />
            </div>
            {errors.email && <span className="text-[11px] text-rose-500 mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border focus:outline-none focus:ring-2 transition-all ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500/50' : 'dark:border-white/10 border-black/10 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50'
                }`}
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 opacity-50" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 hover:opacity-80"
              >
                {showPassword ? <EyeOff className="w-4 h-4 opacity-50" /> : <Eye className="w-4 h-4 opacity-50" />}
              </button>
            </div>
            {errors.password && <span className="text-[11px] text-rose-500 mt-1 block">{errors.password}</span>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded dark:bg-slate-900 border-white/20 text-brand-rose focus:ring-brand-rose/50"
              />
              <span className="opacity-80">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-brand-indigo dark:text-brand-rose hover:underline font-semibold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-gradient-to-r from-brand-rose to-brand-indigo shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs">
          <span className="opacity-70">New here? </span>
          <Link to="/register" className="text-brand-indigo dark:text-brand-rose hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
