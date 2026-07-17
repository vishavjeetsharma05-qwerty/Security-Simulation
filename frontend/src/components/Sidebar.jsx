import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Shield,
  Wrench,
  FileBarChart2,
  History as HistoryIcon,
  User,
  Settings as SettingsIcon,
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, mobileMenuOpen, setMobileMenuOpen } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Red Team', path: '/red-team', icon: Flame },
    { name: 'Blue Team', path: '/blue-team', icon: Shield },
    { name: 'Security Tool', path: '/security-tool', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
    { name: 'History', path: '/history', icon: HistoryIcon },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  if (user && user.role === 'Admin') {
    navItems.splice(navItems.length - 2, 0, { name: 'Admin panel', path: '/admin', icon: ShieldAlert });
  }

  const sidebarClasses = `fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-20 lg:hover:w-64 transition-all duration-300 ease-in-out group ${
    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  } ${theme === 'dark' ? 'glass-card text-slate-200' : 'glass-card-light text-slate-800'} flex flex-col justify-between border-r dark:border-slate-800 border-slate-200 shadow-xl`;

  return (
    <>
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        <div>
          <div className="flex items-center justify-between lg:justify-center group-hover:lg:justify-between h-20 px-6 border-b dark:border-slate-800 border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-indigo text-white shadow-md shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                CYBER SIMULATOR
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-4 flex items-center lg:justify-center group-hover:lg:justify-start gap-3 border-b dark:border-slate-800 border-slate-200 overflow-hidden">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 border border-brand-indigo/35 flex items-center justify-center font-bold text-white text-lg shrink-0">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="overflow-hidden lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <h4 className="font-medium text-sm truncate">{user?.name}</h4>
              <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
                {user?.role}
              </span>
            </div>
          </div>

          <nav className="px-3 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-indigo/10 text-brand-indigo border-l-4 border-brand-indigo shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t dark:border-slate-800 border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
