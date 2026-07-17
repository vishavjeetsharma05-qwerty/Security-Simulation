import React, { useState, useEffect, useContext } from 'react';
import {
  History as HistIcon,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle,
  Activity,
  Trash
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function History() {
  const { theme, addNotification } = useContext(ThemeContext);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadHistory();
  }, [showTrash]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/history?showDeleted=${showTrash}`);
      setLogs(res.data);
    } catch (err) {
      addNotification('Failed to load history logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`);
      addNotification('Item moved to trash.', 'success');
      loadHistory();
    } catch (err) {
      addNotification('Delete failed.', 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.post(`/api/history/${id}/restore`);
      addNotification('Item restored successfully.', 'success');
      loadHistory();
    } catch (err) {
      addNotification('Restore failed.', 'error');
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}/permanent`);
      addNotification('Item permanently deleted.', 'success');
      loadHistory();
    } catch (err) {
      addNotification('Permanent delete failed.', 'error');
    }
  };

  const handleExport = (format) => {
    if (logs.length === 0) {
      addNotification('No data available to export.', 'error');
      return;
    }
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `audit_log_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addNotification('JSON logs exported successfully.', 'success');
    } else if (format === 'csv') {
      const csvHeaders = ['Date', 'User', 'Type', 'Action', 'Details', 'Status', 'Severity'];
      const csvRows = logs.map(item => [
        new Date(item.createdAt).toLocaleString(),
        item.userName,
        item.type,
        item.title,
        item.details.replace(/,/g, ';'),
        item.status,
        item.severity
      ]);
      const csvContent = [csvHeaders.join(','), ...csvRows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `audit_log_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification('CSV logs exported successfully.', 'success');
    }
  };

  const filteredLogs = logs
    .filter(log =>
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    )
    .filter(log =>
      filterType === 'all' ? true : log.type === filterType
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            System Audit History
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Browse and query logs documenting system activities, simulation attempts, and security patches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border dark:border-white/10 border-black/10 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 border dark:border-white/10 border-black/10 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 opacity-50" />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none cursor-pointer"
          >
            <option value="all">All Action Categories</option>
            <option value="scan">Reconnaissance Scans</option>
            <option value="simulation">Red Team Exploits</option>
            <option value="defense">Blue Team Defenses</option>
            <option value="tool">Security Headers tool</option>
            <option value="login">Account Logins</option>
            <option value="activity">Profile activities</option>
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        <div className="flex border dark:border-white/10 border-black/10 rounded-lg overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setShowTrash(false)}
            className={`flex-1 py-2 px-3 transition-colors ${
              !showTrash ? 'bg-brand-indigo/15 text-brand-indigo' : 'bg-transparent opacity-75'
            }`}
          >
            Log Files
          </button>
          <button
            onClick={() => setShowTrash(true)}
            className={`flex-1 py-2 px-3 transition-colors ${
              showTrash ? 'bg-brand-rose/15 text-brand-rose' : 'bg-transparent opacity-75'
            }`}
          >
            Trash Queue
          </button>
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden shadow-lg ${
        theme === 'dark' ? 'glass-card border-white/10' : 'glass-card-light border-black/10'
      }`}>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-black/10 dark:bg-white/5 uppercase tracking-wider text-[10px] opacity-75 border-b dark:border-white/10 border-black/10">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Action Header</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Severity</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/5 divide-black/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 opacity-50 italic">
                    No log items matched current searches.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-[11px] opacity-75">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold">{log.title}</td>
                    <td className="py-4 px-6 max-w-xs truncate opacity-80">{log.details}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'Success'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : log.status === 'Blocked'
                          ? 'bg-cyan-500/10 text-cyan-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'Critical'
                          ? 'bg-rose-600/15 text-brand-rose'
                          : log.severity === 'High'
                          ? 'bg-orange-500/10 text-orange-500'
                          : log.severity === 'Warning'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!showTrash ? (
                        <button
                          onClick={() => handleDelete(log._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors inline-block"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleRestore(log._id)}
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(log._id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
