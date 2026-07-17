import React, { useState, useContext } from 'react';
import { User, Mail, Phone, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const { theme, addNotification } = useContext(ThemeContext);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('bio', bio);
      if (avatar) {
        formData.append('profilePicture', avatar);
      }
      await updateProfile(formData);
      addNotification('Profile settings updated successfully.', 'success');
    } catch (err) {
      addNotification('Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addNotification('Please enter both current and new passwords.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addNotification('New password must be at least 6 characters.', 'error');
      return;
    }
    setUpdatingPassword(true);
    try {
      await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      addNotification('Password updated successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Password update failed.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            User Profile
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Update your personal coordinates and configure password credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <div className={`p-6 rounded-2xl border shadow-lg ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <h3 className="font-bold text-base tracking-tight mb-6">Profile Settings</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-6 items-center border-b dark:border-white/5 border-black/5 pb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 border border-brand-indigo flex items-center justify-center font-bold text-white text-3xl">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                
                <div className="space-y-2 text-center sm:text-left">
                  <span className="block text-xs font-semibold uppercase tracking-wider opacity-75">Upload Avatar Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                    className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-indigo/10 file:text-brand-indigo hover:file:bg-brand-indigo/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                    />
                    <User className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                    />
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Biography</label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2.5 rounded-lg font-bold text-xs tracking-wider text-white bg-brand-indigo hover:shadow-cyan-500/20 active:scale-95 transition-all"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border shadow-lg ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <h3 className="font-bold text-base tracking-tight mb-6">Access Credentials</h3>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2.5 rounded-lg font-bold text-xs tracking-wider text-white bg-brand-rose hover:shadow-red-500/20 active:scale-95 transition-all"
              >
                {updatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <h3 className="font-bold text-base tracking-tight mb-4">Account Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="opacity-75">Linked Email Address</span>
                <span className="font-medium flex items-center gap-1.5 font-mono">{user?.email} <Mail className="w-3.5 h-3.5" /></span>
              </div>
              <div className="flex justify-between items-center py-1 border-t dark:border-white/5 border-black/5">
                <span className="opacity-75">Account Role Level</span>
                <span className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/20">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t dark:border-white/5 border-black/5">
                <span className="opacity-75">Verification State</span>
                <span className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
