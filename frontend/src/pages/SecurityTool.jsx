import React, { useState, useContext } from 'react';
import { Shield, Wrench, Search, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function SecurityTool() {
  const { theme, addNotification } = useContext(ThemeContext);

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) {
      addNotification('Please specify a URL to scan.', 'error');
      return;
    }
    setLoading(true);
    setResults(null);

    try {
      const res = await axios.post('/api/tool/analyze', { url });
      setResults(res.data);
      addNotification('Security headers scan complete!', 'success');
    } catch (err) {
      addNotification('Header scan failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (grade.startsWith('B')) return 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10';
    if (grade.startsWith('C')) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            Security Headers Analyzer
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Perform audit scans on external domains to detect HTTP security configurations and header compliance.
          </p>
        </div>
      </div>

      <div className={`p-6 rounded-2xl border shadow-lg ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. google.com or github.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-mono text-sm"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 opacity-50" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-brand-indigo hover:shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Audit Target'}
          </button>
        </form>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className={`p-6 rounded-2xl border shadow-lg flex flex-col items-center justify-center text-center ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Security Grade</span>
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-5xl font-extrabold my-6 ${getGradeColor(results.grade)} shadow-lg`}>
              {results.grade}
            </div>
            <h4 className="font-bold text-sm truncate max-w-full text-brand-indigo">{results.url}</h4>
            <span className="text-xs opacity-70 mt-1">Score: {results.score} / 100</span>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 space-y-4 ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <h3 className="font-bold text-base tracking-tight mb-2">Audit Checkpoints</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Content-Security-Policy', status: results.findings.csp },
                { label: 'Strict-Transport-Security', status: results.findings.hsts },
                { label: 'X-Frame-Options', status: results.findings.xFrame },
                { label: 'Referrer-Policy', status: results.findings.referrerPolicy },
                { label: 'Permissions-Policy', status: results.findings.permissionsPolicy },
                { label: 'X-Content-Type-Options', status: results.findings.xContentType }
              ].map((h, i) => (
                <div key={i} className="p-3 rounded-lg border border-white/5 bg-black/10 dark:bg-white/5 flex items-center justify-between">
                  <span className="font-medium opacity-80">{h.label}</span>
                  {h.status === 'Enabled' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                      <CheckCircle className="w-3.5 h-3.5" /> Checked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-[10px]">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {results.recommendations.length > 0 && (
            <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-3 space-y-4 ${
              theme === 'dark' ? 'glass-card' : 'glass-card-light'
            }`}>
              <h3 className="font-bold text-base tracking-tight">Hardening Recommendations</h3>
              <div className="space-y-3">
                {results.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs flex gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-rose-500">{rec.header} Header Missing</h5>
                      <p className="opacity-80 mt-1 leading-relaxed">{rec.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
