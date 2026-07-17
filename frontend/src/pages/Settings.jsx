import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettIcon, Eye, Bell, Globe, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function Settings() {
  const { logout } = useContext(AuthContext);
  const { theme, setTheme, language, setLanguage, addNotification } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/auth/delete-account');
      addNotification('Account deleted successfully.', 'success');
      logout();
      navigate('/login');
    } catch (err) {
      addNotification('Delete account request failed.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            System Preferences
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Configure system configurations, application localizations, and audit notification boundaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg space-y-6 ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <h3 className="font-bold text-base tracking-tight mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-indigo" />
            Locale & Theme
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Application Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none cursor-pointer"
              >
                <option value="dark">Dark Theme (Cyberpunk Neon)</option>
                <option value="light">Light Theme (Bright Technology)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">System Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none cursor-pointer"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg space-y-6 ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <h3 className="font-bold text-base tracking-tight mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-rose" />
            Alert Filters & Privacy
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/10 dark:bg-white/5 text-xs">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[10px]">Real-Time Popups</h4>
                <p className="opacity-75 mt-0.5">Toggle browser popup alerts on key actions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifsEnabled}
                  onChange={() => setNotifsEnabled(!notifsEnabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo" />
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/10 dark:bg-white/5 text-xs">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[10px]">Anonymize Audit Trails</h4>
                <p className="opacity-75 mt-0.5">Scrub personal markers from security logs.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyEnabled}
                  onChange={() => setPrivacyEnabled(!privacyEnabled)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo" />
              </label>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 shadow-lg space-y-6 md:col-span-2 ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <h3 className="font-bold text-base text-rose-500 tracking-tight flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-xs opacity-80 leading-relaxed">
            Deleting your account will remove your login credentials, compiled security reports, saved logs, and local simulation files. This operation is permanent and cannot be reversed.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="py-2.5 px-6 rounded-lg font-bold text-xs tracking-wider text-white bg-brand-rose shadow-lg active:scale-95 transition-all"
            >
              Request Account Deletion
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center text-xs">
              <span className="font-bold text-rose-500 uppercase tracking-widest">Are you absolutely sure?</span>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="py-2 px-4 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Yes, Delete Permanently
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-2 px-4 rounded bg-zinc-600 hover:bg-zinc-700 text-white font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
