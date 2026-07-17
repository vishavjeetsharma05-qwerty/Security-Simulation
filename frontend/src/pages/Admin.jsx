import React, { useState, useEffect, useContext } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  FileCode,
  Trash,
  UserCheck,
  UserX,
  Clock,
  Trash2
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function Admin() {
  const { theme, addNotification } = useContext(ThemeContext);

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const analyticRes = await axios.get('/api/admin/analytics');
      setAnalytics(analyticRes.data);

      const userRes = await axios.get('/api/admin/users');
      setUsers(userRes.data);

      const logRes = await axios.get('/api/admin/logs');
      setSystemLogs(logRes.data);
    } catch (err) {
      addNotification('Unauthorized or failed to load administrator dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'Admin' ? 'Student' : 'Admin';
    try {
      await axios.post('/api/admin/update-role', { userId, role: nextRole });
      addNotification('User role status updated.', 'success');
      loadAdminData();
    } catch (err) {
      addNotification('Failed to toggle role.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/user/${userId}`);
      addNotification('User profile deleted successfully.', 'success');
      loadAdminData();
    } catch (err) {
      addNotification('Failed to delete user.', 'error');
    }
  };

  const handleDeleteLogItem = async (logId) => {
    try {
      await axios.delete(`/api/admin/log/${logId}`);
      addNotification('Audit log entry deleted successfully.', 'success');
      loadAdminData();
    } catch (err) {
      addNotification('Failed to delete log entry.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading administrator console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            Administrative Control Panel
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Oversee system utilization metrics, manage student identities, and inspect application-wide security logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Users Registered', val: analytics?.totalUsers, icon: Users, color: 'text-brand-indigo bg-brand-indigo/10 border-brand-indigo/20' },
          { name: 'Simulations Executed', val: analytics?.totalSimulations, icon: FileCode, color: 'text-brand-rose bg-brand-rose/10 border-brand-rose/20' },
          { name: 'Recon Scans Executed', val: analytics?.totalScans, icon: Activity, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
          { name: 'Total Audit Logs Saved', val: analytics?.totalLogs, icon: Clock, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border shadow-md flex justify-between items-center ${
              theme === 'dark' ? 'glass-card' : 'glass-card-light'
            }`}>
              <div>
                <span className="text-xs opacity-75 font-semibold uppercase tracking-wider">{c.name}</span>
                <h3 className="text-2xl font-extrabold mt-1">{c.val}</h3>
              </div>
              <div className={`p-3 rounded-xl border ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex border-b dark:border-white/10 border-black/10 text-sm font-semibold">
        {[
          { id: 'users', label: 'User Profiles Directory', icon: Users },
          { id: 'logs', label: 'Master System Logs', icon: ShieldAlert }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeSubTab === t.id
                  ? 'border-brand-indigo text-brand-indigo opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeSubTab === 'users' && (
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${
          theme === 'dark' ? 'glass-card border-white/10' : 'glass-card-light border-black/10'
        }`}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-black/10 dark:bg-white/5 uppercase tracking-wider text-[10px] opacity-75 border-b dark:border-white/10 border-black/10">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role status</th>
                  <th className="py-4 px-6">Email Verified</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions Override</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5 divide-black/5">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold">{u.name}</td>
                    <td className="py-4 px-6 font-mono text-[11px] opacity-80">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'Admin' ? 'bg-brand-rose/10 text-brand-rose' : 'bg-brand-indigo/10 text-brand-indigo'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="py-4 px-6 opacity-75">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2.5">
                      <button
                        onClick={() => handleRoleToggle(u._id, u.role)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.role === 'Admin' 
                            ? 'text-amber-500 border-amber-500/20 hover:bg-amber-500/10'
                            : 'text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/10'
                        }`}
                        title="Toggle Access Role"
                      >
                        {u.role === 'Admin' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete User profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'logs' && (
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${
          theme === 'dark' ? 'glass-card border-white/10' : 'glass-card-light border-black/10'
        }`}>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-black/10 dark:bg-white/5 uppercase tracking-wider text-[10px] opacity-75 border-b dark:border-white/10 border-black/10">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Student Account</th>
                  <th className="py-4 px-6">Log Event</th>
                  <th className="py-4 px-6">Log Details</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5 divide-black/5">
                {systemLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 opacity-50 italic">
                      No system logs found in database.
                    </td>
                  </tr>
                ) : (
                  systemLogs.map(log => (
                    <tr key={log._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-[11px] opacity-75">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-semibold">{log.userName}</td>
                      <td className="py-4 px-6 font-bold">{log.title}</td>
                      <td className="py-4 px-6 max-w-xs truncate opacity-75">{log.details}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'Critical'
                            ? 'bg-rose-600/15 text-brand-rose'
                            : log.severity === 'High'
                            ? 'bg-orange-500/10 text-orange-500'
                            : 'bg-zinc-500/10 text-zinc-400'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteLogItem(log._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors inline-block"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
