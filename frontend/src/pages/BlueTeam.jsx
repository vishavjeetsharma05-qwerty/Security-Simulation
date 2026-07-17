import React, { useState, useEffect, useContext } from 'react';
import {
  Shield,
  Activity,
  CheckCircle,
  FileCode,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

const FIXES = {
  sqli: {
    title: 'SQL Injection Patch',
    vulnerable: `const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";\ndb.query(query, (err, result) => { ... });`,
    secured: `const query = "SELECT * FROM users WHERE email = ? AND password = ?";\ndb.query(query, [req.body.email, req.body.password], (err, result) => { ... });`,
    options: [
      { text: 'Sanitize query using regex matching filters', correct: false },
      { text: 'Implement prepared queries using parameterized placeholders', correct: true },
      { text: 'Convert SQL queries to use synchronous fs collections', correct: false }
    ],
    defenseName: 'parameterizedQueries'
  },
  xss: {
    title: 'Cross-Site Scripting (XSS) Patch',
    vulnerable: `app.get('/guestbook', (req, res) => {\n  res.send("<div>Welcome, " + req.query.name + "</div>");\n});`,
    secured: `const escapeHtml = (str) => {\n  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");\n};\n\napp.get('/guestbook', (req, res) => {\n  res.send("<div>Welcome, " + escapeHtml(req.query.name) + "</div>");\n});`,
    options: [
      { text: 'Apply context-aware HTML output escaping tags', correct: true },
      { text: 'Store guestbook strings inside environment variables', correct: false },
      { text: 'Limit user inputs length in front-end text fields', correct: false }
    ],
    defenseName: 'xssProtection'
  },
  idor: {
    title: 'Insecure Direct Object Reference Patch',
    vulnerable: `app.get('/api/user/:id', (req, res) => {\n  res.json(db.getUser(req.params.id));\n});`,
    secured: `app.get('/api/user/:id', (req, res) => {\n  if (req.user.role !== 'Admin' && String(req.user._id) !== req.params.id) {\n    return res.status(403).json({ message: 'Access denied' });\n  }\n  res.json(db.getUser(req.params.id));\n});`,
    options: [
      { text: 'Change database keys to follow uuid string keys', correct: false },
      { text: 'Enforce access authorization policies matching owner ID', correct: true },
      { text: 'Disable database connections for anonymous APIs', correct: false }
    ],
    defenseName: 'authorization'
  },
  misconfig: {
    title: 'Security Misconfiguration Patch',
    vulnerable: `const express = require('express');\nconst app = express();\n\napp.listen(5000);`,
    secured: `const express = require('express');\nconst helmet = require('helmet');\nconst app = express();\n\napp.use(helmet());\napp.listen(5000);`,
    options: [
      { text: 'Initialize Helmet middleware to construct HTTP security headers', correct: true },
      { text: 'Run production server listening strictly on localhost loopbacks', correct: false },
      { text: 'Remove unused node modules packages inside servers', correct: false }
    ],
    defenseName: 'helmetSecurity'
  },
  exposure: {
    title: 'Sensitive Data Exposure Patch',
    vulnerable: `res.cookie('auth_token', token);\nres.json({ success: true });`,
    secured: `res.cookie('auth_token', token, {\n  httpOnly: true,\n  secure: true,\n  sameSite: 'strict'\n});\nres.json({ success: true });`,
    options: [
      { text: 'Encrypt cookie keys using MD5 checksum protocols', correct: false },
      { text: 'Bind token values to active socket listeners', correct: false },
      { text: 'Inject token into secure, HTTPOnly and SameSite cookie headers', correct: true }
    ],
    defenseName: 'secureCookies'
  }
};

export default function BlueTeam() {
  const { theme, addNotification } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('mitigate');
  const [defenses, setDefenses] = useState({});
  const [fixes, setFixes] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedFix, setSelectedFix] = useState('sqli');
  const [selectedOption, setSelectedOption] = useState(null);
  const [solvedStatus, setSolvedStatus] = useState(false);

  useEffect(() => {
    async function loadDefensesData() {
      try {
        const res = await axios.get('/api/simulation/defenses');
        setDefenses(res.data.defenses || {});
        setFixes(res.data.fixes || {});
        setSolvedStatus(res.data.fixes?.[selectedFix] || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDefensesData();
  }, [selectedFix]);

  const handleToggle = async (defenseName, currentValue) => {
    try {
      const res = await axios.post('/api/simulation/toggle-defense', {
        defenseName,
        enabled: !currentValue
      });
      setDefenses(res.data.defenses);
      addNotification(`${defenseName} toggle updated!`, 'success');
    } catch (err) {
      addNotification('Failed to toggle defense control.', 'error');
    }
  };

  const handleSolve = async (e) => {
    e.preventDefault();
    if (selectedOption === null) {
      addNotification('Please select an option first.', 'error');
      return;
    }
    
    const isCorrect = FIXES[selectedFix].options[selectedOption].correct;
    if (isCorrect) {
      try {
        const res = await axios.post('/api/simulation/fix', {
          vulnerability: selectedFix,
          solved: true
        });
        setFixes(res.data.fixes);
        setDefenses(res.data.defenses);
        setSolvedStatus(true);
        addNotification('Correct patch! Vulnerability solved and related defense enabled.', 'success');
      } catch (err) {
        addNotification('Failed to save patch state.', 'error');
      }
    } else {
      addNotification('Incorrect patch choice. Analyze code blocks carefully.', 'error');
    }
  };

  const handleFixSelect = (fixKey) => {
    setSelectedFix(fixKey);
    setSelectedOption(null);
    setSolvedStatus(fixes[fixKey] || false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading defense system...</span>
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
            Blue Team Operations (Defense)
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Mitigate security threats by applying secure code patches and configuring active traffic filters.
          </p>
        </div>
      </div>

      <div className="flex border-b dark:border-white/10 border-black/10 text-sm font-semibold">
        {[
          { id: 'mitigate', label: 'Vulnerability Patch Center', icon: FileCode },
          { id: 'controls', label: 'Active Security Controls', icon: Sliders }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                activeTab === t.id
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

      {activeTab === 'mitigate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {Object.keys(FIXES).map((key) => {
              const f = FIXES[key];
              const isSolved = fixes[key] || false;
              return (
                <button
                  key={key}
                  onClick={() => handleFixSelect(key)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedFix === key
                      ? 'border-brand-indigo bg-brand-indigo/10 shadow-md'
                      : 'border-white/10 dark:hover:bg-white/5 hover:bg-black/5'
                  } ${theme === 'dark' ? 'glass-card' : 'glass-card-light'}`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">{f.title}</h4>
                    {isSolved ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        Patched
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 border border-rose-500/30">
                        Vulnerable
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 space-y-6 ${
            theme === 'dark' ? 'glass-card' : 'glass-card-light'
          }`}>
            <h3 className="font-bold text-lg tracking-tight">
              {FIXES[selectedFix].title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <span className="block font-bold mb-2 uppercase tracking-wider text-[10px] text-rose-500">Vulnerable Code</span>
                <pre className="font-mono text-[10px] overflow-x-auto text-rose-400 bg-black/25 p-3 rounded-lg leading-relaxed">
                  {FIXES[selectedFix].vulnerable}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="block font-bold mb-2 uppercase tracking-wider text-[10px] text-emerald-500">Remedied Code</span>
                <pre className="font-mono text-[10px] overflow-x-auto text-emerald-400 bg-black/25 p-3 rounded-lg leading-relaxed">
                  {FIXES[selectedFix].secured}
                </pre>
              </div>
            </div>

            {solvedStatus ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold mb-0.5">Secure Code Active</h4>
                  <p className="opacity-80">This vulnerability has been patched. The associated server defense variable ({FIXES[selectedFix].defenseName}) is active.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSolve} className="space-y-4">
                <div className="space-y-3">
                  <span className="block font-bold uppercase tracking-wider text-[10px] text-brand-indigo">Select the Correct Remediation Choice</span>
                  {FIXES[selectedFix].options.map((opt, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                        selectedOption === index
                          ? 'border-brand-indigo bg-brand-indigo/10'
                          : 'border-white/10 dark:hover:bg-white/5 hover:bg-black/5'
                      }`}
                    >
                      <input
                        type="radio"
                        name="remediation-option"
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                        className="mt-0.5 text-brand-indigo focus:ring-brand-indigo/50"
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-brand-indigo hover:shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  Save Patch Verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'controls' && (
        <div className={`p-6 rounded-2xl border shadow-lg ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div className="mb-6">
            <h3 className="font-bold text-base tracking-tight mb-1">Defense Controls</h3>
            <p className="text-xs opacity-75">Manually enable or disable system hardening parameters to simulate network changes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(defenses).map((key) => {
              const isEnabled = defenses[key];
              return (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-white/10 bg-black/10 dark:bg-white/5 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</h4>
                    <span className={`text-[10px] font-semibold mt-1 inline-block ${
                      isEnabled ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {isEnabled ? 'ACTIVE SHIELD' : 'INACTIVE'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(key, isEnabled)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo" />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
