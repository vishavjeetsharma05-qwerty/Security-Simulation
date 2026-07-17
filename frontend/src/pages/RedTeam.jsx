import React, { useState, useContext } from 'react';
import {
  Terminal,
  Activity,
  Flame,
  Wrench,
  AlertTriangle,
  Play,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

const VULNERABILITIES = {
  sqli: {
    title: 'SQL Injection (SQLi)',
    severity: 'Critical',
    score: '9.8 / 10',
    owasp: 'A03:2021-Injection',
    explanation: 'SQL Injection occurs when untrusted input is concatenated directly into SQL queries without proper parameterization. This lets an attacker manipulate queries and access or modify database records.',
    payload: "' OR 1=1 --",
    exampleCode: "SELECT * FROM users WHERE email = '\" + userInput + \"' AND password = '\" + hash + \"';",
    prevention: 'Always use Parameterized Queries (Prepared Statements) or an ORM. Never concatenate variables directly into SQL queries.',
    demoDescription: 'Try executing an SQL injection against the authentication database to bypass login filters.'
  },
  xss: {
    title: 'Cross-Site Scripting (XSS)',
    severity: 'High',
    score: '8.2 / 10',
    owasp: 'A03:2021-Injection',
    explanation: 'Cross-Site Scripting occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing malicious scripts to execute in the victim browser.',
    payload: "<script>alert('XSS')</script>",
    exampleCode: "document.getElementById('welcome').innerHTML = 'Hello, ' + userQueryName;",
    prevention: 'Apply context-aware output encoding (escaping html tags) and implement strict Content Security Policy (CSP) headers.',
    demoDescription: 'Try injecting script payloads into the guestbook feedback field.'
  },
  idor: {
    title: 'Insecure Direct Object References (IDOR)',
    severity: 'High',
    score: '8.5 / 10',
    owasp: 'A01:2021-Broken Access Control',
    explanation: 'IDOR happens when an application provides direct access to objects based on user-supplied input without verifying if the user has authorization to retrieve the resource.',
    payload: "/api/user/vraj_admin",
    exampleCode: "app.get('/api/user/:id', (req, res) => { res.json(db.getUser(req.params.id)); });",
    prevention: 'Enforce role-based access authorization checks. Ensure users are validated against their session permissions before loading requested resource IDs.',
    demoDescription: 'Try requesting admin details directly by altering parameters.'
  },
  misconfig: {
    title: 'Security Misconfiguration',
    severity: 'Medium',
    score: '6.5 / 10',
    owasp: 'A05:2021-Security Misconfiguration',
    explanation: 'Security Misconfigurations include default accounts, active directory listings, missing headers, verbose error traces, or unhardened servers.',
    payload: "GET /config.bak",
    exampleCode: "app.use(express.static('public', { dotfiles: 'allow' })); // exposes dotfiles",
    prevention: 'Use Helmet to apply HTTP security headers, disable directory listings, configure TLS properly, and disable detailed debug logs in production.',
    demoDescription: 'Try querying backup configuration endpoints.'
  },
  exposure: {
    title: 'Sensitive Data Exposure',
    severity: 'High',
    score: '7.5 / 10',
    owasp: 'A02:2021-Cryptographic Failures',
    explanation: 'Sensitive Data Exposure occurs when applications store or transmit data like passwords, session tokens, or personal identifiers in cleartext or weak hashes.',
    payload: "document.cookie",
    exampleCode: "res.cookie('session_token', token); // missing secure & HttpOnly parameters",
    prevention: 'Use secure, HTTPOnly session cookies. Encrypt data at rest using AES-256 and data in transit using TLS 1.3.',
    demoDescription: 'Try capturing raw session cookies.'
  }
};

export default function RedTeam() {
  const { theme, addNotification } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('recon');
  
  const [targetUrl, setTargetUrl] = useState('simulation-target.local');
  const [scanType, setScanType] = useState('recon');
  const [scanLogs, setScanLogs] = useState([]);
  const [scanning, setScanning] = useState(false);

  const [selectedVuln, setSelectedVuln] = useState('sqli');

  const [exploitVuln, setExploitVuln] = useState('sqli');
  const [exploitPayload, setExploitPayload] = useState(VULNERABILITIES.sqli.payload);
  const [exploitLogs, setExploitLogs] = useState([]);
  const [exploitSuccess, setExploitSuccess] = useState(null);
  const [exploitFlag, setExploitFlag] = useState('');
  const [executing, setExecuting] = useState(false);

  const handleRunScan = async (e) => {
    e.preventDefault();
    if (!targetUrl) {
      addNotification('Please enter a target address.', 'error');
      return;
    }
    setScanning(true);
    setScanLogs(['[+] Initializing attack scanner...']);
    
    try {
      const res = await axios.post('/api/simulation/scan', { targetUrl, scanType });
      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < res.data.logs.length) {
          setScanLogs(prev => [...prev, res.data.logs[currentIdx]]);
          currentIdx++;
        } else {
          clearInterval(interval);
          setScanning(false);
          addNotification('Reconnaissance scan completed!', 'success');
        }
      }, 700);
    } catch (err) {
      setScanLogs(prev => [...prev, '[-] Connection timeout. Target did not respond.']);
      setScanning(false);
    }
  };

  const handleExploitSelect = (vulnKey) => {
    setExploitVuln(vulnKey);
    setExploitPayload(VULNERABILITIES[vulnKey].payload);
    setExploitLogs([]);
    setExploitSuccess(null);
    setExploitFlag('');
  };

  const handleRunExploit = async (e) => {
    e.preventDefault();
    if (!exploitPayload) {
      addNotification('Please provide an exploit payload.', 'error');
      return;
    }
    setExecuting(true);
    setExploitLogs(['[+] Initializing exploit script...', '[+] Sending payload details...']);
    setExploitSuccess(null);
    setExploitFlag('');

    try {
      const res = await axios.post('/api/simulation/exploit', {
        vulnerability: exploitVuln,
        payload: exploitPayload
      });

      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < res.data.logs.length) {
          setExploitLogs(prev => [...prev, res.data.logs[currentIdx]]);
          currentIdx++;
        } else {
          clearInterval(interval);
          setExecuting(false);
          setExploitSuccess(res.data.success);
          if (res.data.success) {
            setExploitFlag(res.data.flag);
            addNotification('Exploit succeeded!', 'success');
          } else {
            addNotification('Exploit blocked by active defenses.', 'info');
          }
        }
      }, 600);
    } catch (err) {
      setExploitLogs(prev => [...prev, '[-] Script execution failed. Connection reset.']);
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={`p-6 rounded-2xl border shadow-xl flex items-center justify-between gap-6 transition-all ${
        theme === 'dark' ? 'glass-card' : 'glass-card-light'
      }`}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r dark:from-white dark:to-slate-400 from-slate-900 to-slate-700">
            Red Team Operations (Attack)
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Simulate reconnaissance, identify common OWASP vulnerabilities, and launch ethical sandbox exploits.
          </p>
        </div>
      </div>

      <div className="flex border-b dark:border-white/10 border-black/10 text-sm font-semibold">
        {[
          { id: 'recon', label: 'Reconnaissance', icon: Wrench },
          { id: 'vuln', label: 'Vulnerabilities Catalog', icon: AlertTriangle },
          { id: 'exploit', label: 'Exploitation Terminal', icon: Terminal }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-brand-rose text-brand-rose opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'recon' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <div>
              <h3 className="font-bold text-base tracking-tight mb-2">Recon Parameters</h3>
              <p className="text-xs opacity-75 mb-6">Select a scan mode and input target address details below.</p>
              
              <form onSubmit={handleRunScan} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Target Host</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    disabled={scanning}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Scan Type</label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    disabled={scanning}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all cursor-pointer"
                  >
                    <option value="recon">Information Gathering (WHOIS)</option>
                    <option value="port">Port Scanning (Nmap)</option>
                    <option value="service">Service & Version Detection</option>
                    <option value="directory">Directory Enumeration (Dirbuster)</option>
                    <option value="tech">Technology Detection (Wappalyzer)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={scanning}
                  className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-brand-rose hover:shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {scanning ? 'Scanning Host...' : 'Launch Recon Scan'}
                </button>
              </form>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <div>
              <h3 className="font-bold text-base tracking-tight mb-2">Scanner Console Output</h3>
              <p className="text-xs opacity-75 mb-4">Observe dynamic scanner probes against the target server.</p>
            </div>

            <div className="h-72 w-full p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1.5 shadow-inner">
              {scanLogs.length === 0 ? (
                <div className="text-zinc-600 italic">Console idle. Input host to begin scanning.</div>
              ) : (
                scanLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
              {scanning && <div className="w-3 h-4 bg-emerald-400 animate-pulse inline-block" />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vuln' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {Object.keys(VULNERABILITIES).map((key) => {
              const v = VULNERABILITIES[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedVuln(key)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedVuln === key
                      ? 'border-brand-rose bg-brand-rose/10 shadow-md'
                      : 'border-white/10 dark:hover:bg-white/5 hover:bg-black/5 opacity-80 hover:opacity-100'
                  } ${theme === 'dark' ? 'glass-card' : 'glass-card-light'}`}
                >
                  <h4 className="font-bold text-sm">{v.title}</h4>
                  <div className="flex gap-4 mt-2 text-[10px] uppercase font-bold tracking-wider">
                    <span className={v.severity === 'Critical' ? 'text-rose-500' : 'text-amber-500'}>
                      Severity: {v.severity}
                    </span>
                    <span className="opacity-60">{v.owasp}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 space-y-6 ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl tracking-tight">
                  {VULNERABILITIES[selectedVuln].title}
                </h3>
                <span className="text-xs font-bold px-3 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  CVSS v3: {VULNERABILITIES[selectedVuln].score}
                </span>
              </div>
              <p className="text-xs opacity-75 mt-3 leading-relaxed">
                {VULNERABILITIES[selectedVuln].explanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/10 dark:bg-white/5 border dark:border-white/5 border-black/5">
                <span className="block font-bold mb-2 uppercase tracking-wider text-[10px] text-brand-indigo">Vulnerable Code snippet</span>
                <pre className="font-mono text-[10px] overflow-x-auto text-rose-400 bg-black/20 p-2.5 rounded-lg border border-black/30">
                  {VULNERABILITIES[selectedVuln].exampleCode}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-black/10 dark:bg-white/5 border dark:border-white/5 border-black/5">
                <span className="block font-bold mb-2 uppercase tracking-wider text-[10px] text-brand-rose">Vulnerability Payload example</span>
                <pre className="font-mono text-[10px] overflow-x-auto text-amber-400 bg-black/20 p-2.5 rounded-lg border border-black/30 select-all">
                  {VULNERABILITIES[selectedVuln].payload}
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block font-bold uppercase tracking-wider text-[10px] text-emerald-500 mb-1.5">Prevention Strategy</span>
                <p className="text-xs opacity-80 leading-relaxed">
                  {VULNERABILITIES[selectedVuln].prevention}
                </p>
              </div>
              <div className="flex gap-2 text-[10px] uppercase font-bold opacity-60">
                <FileText className="w-4 h-4" />
                <span>OWASP Reference: {VULNERABILITIES[selectedVuln].owasp}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exploit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <div>
              <h3 className="font-bold text-base tracking-tight mb-2">Sandbox Configs</h3>
              <p className="text-xs opacity-75 mb-6">Select a vulnerability lab module and verify target payloads.</p>

              <div className="space-y-2 mb-6">
                {Object.keys(VULNERABILITIES).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleExploitSelect(key)}
                    disabled={executing}
                    className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg border text-left transition-all ${
                      exploitVuln === key
                        ? 'border-brand-rose bg-brand-rose/10 text-brand-rose'
                        : 'border-white/10 dark:hover:bg-white/5 hover:bg-black/5'
                    }`}
                  >
                    {VULNERABILITIES[key].title}
                  </button>
                ))}
              </div>

              <form onSubmit={handleRunExploit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Exploit Payload</label>
                  <textarea
                    rows={3}
                    value={exploitPayload}
                    onChange={(e) => setExploitPayload(e.target.value)}
                    disabled={executing}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={executing}
                  className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-brand-rose hover:shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {executing ? 'Executing...' : 'Run Exploit Sandbox'}
                </button>
              </form>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <div>
              <h3 className="font-bold text-base tracking-tight mb-2">Exploit Terminal Console</h3>
              <p className="text-xs opacity-75 mb-4">Output logs detailing injection/exploit validation steps.</p>
            </div>

            <div className="flex-1 min-h-60 p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-rose-400 overflow-y-auto space-y-1.5 mb-6 shadow-inner">
              {exploitLogs.length === 0 ? (
                <div className="text-zinc-600 italic">Terminal waiting for payload execution triggers.</div>
              ) : (
                exploitLogs.map((log, index) => (
                  <div key={index} className={`leading-relaxed whitespace-pre-wrap ${log.startsWith('[+') ? 'text-emerald-400' : log.startsWith('[!') ? 'text-amber-400' : 'text-rose-400'}`}>
                    {log}
                  </div>
                ))
              )}
              {executing && <div className="w-3 h-4 bg-rose-400 animate-pulse inline-block" />}
            </div>

            {exploitSuccess !== null && (
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs transition-all ${
                exploitSuccess
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              }`}>
                <div>
                  <h4 className="font-bold mb-1">
                    {exploitSuccess ? 'Lab Vulnerable: Exploit Succeeded' : 'System Secure: Exploit Blocked'}
                  </h4>
                  <p className="opacity-80">
                    {exploitSuccess
                      ? 'The payload bypassed filters. The flag has been exposed in memory.'
                      : 'The active Blue Team defense patch successfully neutralized this payload.'}
                  </p>
                </div>
                {exploitSuccess && (
                  <span className="font-bold font-mono bg-black/40 px-3 py-1.5 rounded select-all text-rose-300 border border-rose-500/30 whitespace-nowrap">
                    {exploitFlag}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
