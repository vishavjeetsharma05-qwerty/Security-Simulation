import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  FileText,
  Activity,
  UserCheck,
  Shield,
  Wrench,
  Flame,
  ShieldAlert,
  History as HistoryIcon
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme, mobileMenuOpen, setMobileMenuOpen, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Login Successful', type: 'info', time: 'Just now' },
    { id: 2, text: 'Simulation Completed: SQL Injection', type: 'success', time: '5m ago' },
    { id: 3, text: 'Profile Updated', type: 'info', time: '1h ago' }
  ]);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val) {
      setSearchResults([]);
      return;
    }

    const staticModules = [
      { name: 'Red Team - Reconnaissance', path: '/red-team', category: 'Module', icon: Activity },
      { name: 'Red Team - Vulnerability Discovery', path: '/red-team', category: 'Module', icon: Activity },
      { name: 'Blue Team - Mitigations', path: '/blue-team', category: 'Module', icon: Activity },
      { name: 'Security Headers Analyzer', path: '/security-tool', category: 'Module', icon: Wrench },
      { name: 'Audit Reports Generation', path: '/reports', category: 'Module', icon: FileText }
    ];

    const matchedStatic = staticModules.filter(m =>
      m.name.toLowerCase().includes(val.toLowerCase())
    );

    try {
      const res = await axios.get('/api/history');
      const matchedHistory = res.data
        .filter(item =>
          item.title.toLowerCase().includes(val.toLowerCase()) ||
          item.details.toLowerCase().includes(val.toLowerCase())
        )
        .slice(0, 5)
        .map(h => ({
          name: `${h.title} (${h.status})`,
          path: '/history',
          category: 'History',
          icon: Activity
        }));

      setSearchResults([...matchedStatic, ...matchedHistory]);
    } catch (err) {
      setSearchResults(matchedStatic);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Red Team', path: '/red-team' },
    { name: 'Blue Team', path: '/blue-team' },
    { name: 'Security Tool', path: '/security-tool' },
    { name: 'Reports', path: '/reports' },
    { name: 'History', path: '/history' },
  ];

  if (user && user.role === 'Admin') {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <>
      <header className={`fixed top-0 right-0 left-0 z-30 h-20 px-4 md:px-8 flex items-center justify-between border-b transition-colors duration-300 ${
        theme === 'dark' ? 'glass-card border-slate-800 text-slate-200' : 'glass-card-light border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-indigo text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700 whitespace-nowrap">
              CYBER SIMULATOR
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 ml-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-indigo/10 text-brand-indigo shadow-sm'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-48 lg:w-60">
            <input
              type="text"
              placeholder="Search..."
              onClick={() => setSearchOpen(true)}
              readOnly
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-black/5 dark:bg-white/5 border dark:border-slate-800 border-slate-200 focus:outline-none cursor-pointer hover:border-brand-indigo/50 transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-50" />
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 md:hidden"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-transform duration-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-rose animate-pulse" />
              )}
            </button>

            {notificationsOpen && (
              <div className={`absolute right-0 mt-3 w-80 rounded-xl border shadow-xl overflow-hidden transition-all z-50 ${
                theme === 'dark' ? 'glass-card border-slate-800 text-slate-200' : 'glass-card-light border-slate-200 text-slate-800'
              }`}>
                <div className="px-4 py-3 border-b dark:border-slate-800 border-slate-200 flex justify-between items-center bg-black/10 dark:bg-white/5">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs text-brand-rose hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs opacity-50">No new alerts</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 border-b dark:border-slate-800 border-slate-200 hover:bg-black/5 dark:hover:bg-white/5 flex gap-3 text-xs">
                        <div className="pt-0.5">
                          <Activity className="w-4 h-4 text-brand-indigo shrink-0" />
                        </div>
                        <div>
                          <p>{n.text}</p>
                          <span className="text-[10px] opacity-50 block mt-1">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-brand-indigo/35 flex items-center justify-center font-bold text-white text-sm">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className={`absolute right-0 mt-3 w-52 rounded-xl border shadow-xl overflow-hidden transition-all z-50 ${
                theme === 'dark' ? 'glass-card border-slate-800 text-slate-200' : 'glass-card-light border-slate-200 text-slate-800'
              }`}>
                <div className="p-3 border-b dark:border-slate-800 border-slate-200 hover:bg-black/5 dark:hover:bg-white/5">
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 text-xs font-semibold">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                </div>
                <div className="p-3 border-b dark:border-slate-800 border-slate-200 hover:bg-black/5 dark:hover:bg-white/5">
                  <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 text-xs font-semibold">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </div>
                <div className="p-3 hover:bg-rose-500/10 text-rose-500">
                  <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-semibold w-full">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className={`fixed top-20 left-0 right-0 z-20 border-b shadow-xl lg:hidden flex flex-col p-4 space-y-1.5 transition-all ${
          theme === 'dark' ? 'glass-card border-slate-800 text-slate-200' : 'glass-card-light border-slate-200 text-slate-800'
        }`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-indigo/10 text-brand-indigo'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
            theme === 'dark' ? 'glass-card border-slate-800 text-slate-200' : 'glass-card-light border-slate-200 text-slate-800'
          }`}>
            <div className="p-4 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <Search className="w-5 h-5 opacity-60" />
                <input
                  type="text"
                  placeholder="Search across history, reports, and modules..."
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent focus:outline-none text-base border-none"
                />
              </div>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 opacity-50 text-sm">
                  {searchQuery ? 'No results found matching your query.' : 'Type to search modules and history...'}
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((res, i) => {
                    const Icon = res.icon;
                    return (
                      <Link
                        key={i}
                        to={res.path}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-brand-indigo" />
                          <span className="text-sm font-medium">{res.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded dark:bg-white/10 bg-black/10 opacity-70">
                          {res.category}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
