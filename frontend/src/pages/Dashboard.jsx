import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Flame,
  Shield,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const [stats, setStats] = useState({
    completedSimulations: 0,
    activeDefenses: 0,
    securityScore: 30,
    scansPerformed: 0,
    blockedAttacks: 0,
    successfulAttacks: 0
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await axios.get('/api/simulation/stats');
        setStats(statsRes.data);

        const logsRes = await axios.get('/api/history');
        setRecentLogs(logsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const chartData = [
    { name: 'Mon', attacks: 4, defense: 2 },
    { name: 'Tue', attacks: 6, defense: 3 },
    { name: 'Wed', attacks: 8, defense: 5 },
    { name: 'Thu', attacks: 5, defense: 7 },
    { name: 'Fri', attacks: 7, defense: 8 },
    { name: 'Sat', attacks: stats.successfulAttacks, defense: stats.blockedAttacks },
  ];

  const vulnData = [
    { name: 'Fixed', value: stats.completedSimulations },
    { name: 'Vulnerable', value: 5 - stats.completedSimulations }
  ];

  const PIE_COLORS = theme === 'dark' ? ['#00f0ff', '#ff003c'] : ['#0284c7', '#e11d48'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading secure dashboard...</span>
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
            Welcome Back, {user?.name}
          </h1>
          <p className="text-sm opacity-70 mt-1">
            System Status: <span className="font-semibold text-emerald-500">Operational</span>. The simulation is active and monitoring.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="px-4 py-2 rounded-xl bg-black/10 dark:bg-white/5 border dark:border-white/5 border-black/5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-indigo" />
            <span>Last Login: Just now</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Completed Sims', val: stats.completedSimulations, desc: 'Out of 5 labs complete', color: 'from-blue-600 to-brand-indigo', icon: Flame },
          { name: 'Active Defenses', val: stats.activeDefenses, desc: 'Security headers & filters', color: 'from-emerald-600 to-teal-500', icon: Shield },
          { name: 'Scans Performed', val: stats.scansPerformed, desc: 'Header & port enumerations', color: 'from-amber-600 to-yellow-500', icon: Wrench },
          { name: 'Blocked Attacks', val: stats.blockedAttacks, desc: 'Red team intrusion blocked', color: 'from-brand-rose to-rose-500', icon: Activity }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border shadow-lg hover:-translate-y-1 transition-all ${
              theme === 'dark' ? 'glass-card' : 'glass-card-light'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs opacity-75 font-semibold uppercase tracking-wider">{c.name}</span>
                  <h3 className="text-3xl font-extrabold mt-1.5">{c.val}</h3>
                </div>
                <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${c.color} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs opacity-60 mt-3">{c.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Overall Security Score</h3>
            <p className="text-xs opacity-70 mb-4">Calculated from vulnerabilities fixed and active mitigations.</p>
          </div>
          
          <div className="relative flex justify-center py-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={stats.securityScore > 75 ? '#10b981' : stats.securityScore > 50 ? '#f59e0b' : '#ff003c'}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * stats.securityScore) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold">{stats.securityScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-0.5">Rating</span>
            </div>
          </div>

          <div className="text-center text-xs opacity-80 mt-4">
            {stats.securityScore > 75
              ? 'Excellent! Most vulnerabilities resolved.'
              : stats.securityScore > 50
              ? 'Moderate safety. Patch more exploits to increase score.'
              : 'Warning: High exposure risk. Enable defense controls.'}
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between lg:col-span-2 ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Attack Success vs Defense Level</h3>
            <p className="text-xs opacity-70 mb-4">Activity comparison showing exploit block trends.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="attackG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff003c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff003c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="defenseG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#52525b' : '#a1a1aa'} fontSize={10} />
                <YAxis stroke={theme === 'dark' ? '#52525b' : '#a1a1aa'} fontSize={10} />
                <Tooltip contentStyle={{ background: theme === 'dark' ? '#18181b' : '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="attacks" stroke="#ff003c" fillOpacity={1} fill="url(#attackG)" strokeWidth={2} name="Exploits Run" />
                <Area type="monotone" dataKey="defense" stroke="#00f0ff" fillOpacity={1} fill="url(#defenseG)" strokeWidth={2} name="Attacks Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Vulnerabilities</h3>
            <p className="text-xs opacity-70 mb-4">Status of SQLi, XSS, IDOR, Misconfig and Exposure.</p>
          </div>

          <div className="h-44 w-full flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vulnData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vulnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold">{stats.completedSimulations}/5</span>
              <span className="text-[9px] uppercase font-bold opacity-60">Fixed</span>
            </div>
          </div>

          <div className="flex justify-around text-xs mt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[0] }} />
              <span>Patched</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[1] }} />
              <span>Vulnerable</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Latest Simulation Activity</h3>
            <p className="text-xs opacity-70 mb-4">Recent system audit logs and simulation actions.</p>
          </div>

          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-10 text-xs opacity-50">No activity logged yet. Launch simulations to view stats.</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log._id} className="flex justify-between items-center text-xs p-3 rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/5 border-black/5 hover:border-brand-indigo/30 transition-all">
                  <div className="flex items-center gap-3">
                    {log.status === 'Blocked' ? (
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : log.severity === 'Critical' ? (
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-brand-rose">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-brand-indigo">
                        <Activity className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h5 className="font-semibold">{log.title}</h5>
                      <p className="text-[10px] opacity-75 truncate max-w-sm md:max-w-md">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[9px] opacity-55 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Link to="/history" className="inline-flex items-center gap-1.5 text-xs text-brand-indigo dark:text-brand-rose font-semibold hover:underline">
              View Audit History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
