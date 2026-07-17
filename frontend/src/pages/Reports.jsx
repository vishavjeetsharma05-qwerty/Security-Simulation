import React, { useState, useContext, useEffect } from 'react';
import { FileText, Download, Shield, FileCheck2, ScrollText, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

export default function Reports() {
  const { user } = useContext(AuthContext);
  const { theme, addNotification } = useContext(ThemeContext);

  const [studentName, setStudentName] = useState(user?.name || 'Vraj Patel');
  const [projectName, setProjectName] = useState('RED vs BLUE Team Security Simulation');
  const [reportType, setReportType] = useState('final');
  
  const [stats, setStats] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportStats() {
      try {
        const statsRes = await axios.get('/api/simulation/stats');
        setStats(statsRes.data);
        const histRes = await axios.get('/api/history');
        setHistoryItems(histRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReportStats();
  }, []);

  const handleDownloadPDF = () => {
    if (!stats) return;
    addNotification('Compiling report and generating PDF...', 'info');

    const doc = new jsPDF();
    const primaryColor = [26, 36, 43];
    const highlightColor = reportType === 'attack' ? [255, 0, 60] : reportType === 'defense' ? [0, 240, 255] : [100, 116, 139];
    
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 80, 'F');

    doc.setFillColor(highlightColor[0], highlightColor[1], highlightColor[2]);
    doc.rect(0, 78, 210, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('Helvetica', 'bold');
    
    const titleText = reportType === 'attack' 
      ? 'RED TEAM ATTACK REPORT' 
      : reportType === 'defense' 
      ? 'BLUE TEAM DEFENSE REPORT' 
      : 'FINAL SECURITY SIMULATION REPORT';
    
    doc.text(titleText, 20, 45);
    
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text('Cybersecurity Simulation Laboratory', 20, 58);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(13);
    doc.setFont('Helvetica', 'bold');
    doc.text('PROJECT METADATA', 20, 105);

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    
    const metadataY = 115;
    doc.text('Project Name:', 20, metadataY);
    doc.text(projectName, 60, metadataY);

    doc.text('Date Compiled:', 20, metadataY + 10);
    doc.text(new Date().toLocaleDateString(), 60, metadataY + 10);

    doc.text('Author / Student:', 20, metadataY + 20);
    doc.text(studentName, 60, metadataY + 20);

    doc.text('Evaluation Score:', 20, metadataY + 30);
    doc.text(`${stats.securityScore} / 100`, 60, metadataY + 30);

    doc.text('Completed Labs:', 20, metadataY + 40);
    doc.text(`${stats.completedSimulations} of 5 Vulnerability Blocks Resolved`, 60, metadataY + 40);

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, 175, 170, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('CONFIDENTIALITY NOTICE', 25, 185);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('This document contains details gathered during a controlled sandbox assessment.', 25, 193);
    doc.text('It should be treated as proprietary and handled in accordance with privacy policies.', 25, 199);

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.text('Generated via Cybersecurity Simulation Dashboard', 20, 275);
    doc.text('Page 1 of 2', 170, 275);

    doc.addPage();
    doc.setTextColor(26, 36, 43);

    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    
    const summaryText = reportType === 'attack'
      ? 'This report details scans and payloads executed against sandbox application interfaces. It highlights security weaknesses uncovered during the reconnaissance and vulnerability discovery labs (including SQLi, XSS, and IDOR), serving as documentation for structural patches.'
      : reportType === 'defense'
      ? 'This report details configuration adjustments and secure filters applied to sandbox targets. It confirms that traffic validation, input-escaping headers, and database parameters successfully neutralized intrusion attempts, establishing a secure runtime.'
      : 'This compiled report covers both ethical attack probes and defensive mitigations. It documents the transition of sandbox interfaces from an unhardened vulnerable state into a protected security posture with an updated security score of ' + stats.securityScore + '%.';
    
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, 35);

    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('SIMULATION LOGS AND AUDIT TRAIL', 20, 65);

    const tableRows = historyItems
      .filter(item => {
        if (reportType === 'attack') return item.type === 'scan' || item.type === 'simulation';
        if (reportType === 'defense') return item.type === 'defense';
        return true;
      })
      .slice(0, 10)
      .map(item => [
        new Date(item.createdAt).toLocaleDateString(),
        item.title,
        item.status,
        item.severity
      ]);

    doc.autoTable({
      startY: 72,
      head: [['Date', 'Action', 'Status', 'Severity']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillGray: true, textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('CONCLUSION', 20, finalY);
    
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    const conclusionText = reportType === 'attack'
      ? 'Immediate deployment of input parameter sanitization and secure HTTP headers is recommended to lock down the exposed vulnerabilities identified.'
      : reportType === 'defense'
      ? 'All defensive adjustments are verified as functional. Regular audit scans should be scheduled to confirm security state remains hardened.'
      : 'The exercises demonstrate the critical importance of a layered security model. Secure programming practices combined with web server security headers effectively neutralize the majority of common OWASP top 10 risks.';
    
    const splitConclusion = doc.splitTextToSize(conclusionText, 170);
    doc.text(splitConclusion, 20, finalY + 8);

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.text('Generated via Cybersecurity Simulation Dashboard', 20, 275);
    doc.text('Page 2 of 2', 170, 275);

    const fileBase = reportType === 'attack' ? 'Attack_Report' : reportType === 'defense' ? 'Defense_Report' : 'Final_Security_Report';
    doc.save(`${fileBase}_${Date.now()}.pdf`);
    addNotification('PDF report downloaded successfully.', 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin" />
        <span className="text-sm font-semibold opacity-75">Loading report compiler...</span>
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
            Audit Reports Center
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Compile findings and actions into downloadable PDF documents matching academic project requirements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg flex flex-col justify-between ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Report Configuration</h3>
            <p className="text-xs opacity-75 mb-6">Customize cover details and select template types below.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Report Template</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'attack', label: 'Attack', icon: AlertTriangle },
                    { id: 'defense', label: 'Defense', icon: Shield },
                    { id: 'final', label: 'Final', icon: FileCheck2 }
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setReportType(t.id)}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                          reportType === t.id
                            ? 'border-brand-indigo bg-brand-indigo/15 text-brand-indigo'
                            : 'border-white/10 dark:hover:bg-white/5 hover:bg-black/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-black/10 dark:bg-white/5 border dark:border-white/10 border-black/10 focus:outline-none focus:ring-2 dark:focus:ring-brand-rose/50 focus:ring-brand-indigo/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="w-full py-3 rounded-lg font-bold text-sm tracking-wider text-white bg-brand-indigo hover:shadow-cyan-500/20 active:scale-95 transition-all mt-6 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between overflow-hidden relative ${
          theme === 'dark' ? 'glass-card' : 'glass-card-light'
        }`}>
          <div>
            <h3 className="font-bold text-base tracking-tight mb-2">Live Document Cover Preview</h3>
            <p className="text-xs opacity-75 mb-6">Visual representation of compiled PDF cover page details.</p>
          </div>

          <div className="flex-1 rounded-xl bg-white text-zinc-800 p-8 border border-zinc-200 shadow-inner flex flex-col justify-between aspect-[1/1.41] max-w-md mx-auto w-full select-none">
            <div className="space-y-6">
              <div className="bg-zinc-900 text-white -mx-8 -mt-8 p-8 border-b-4 border-brand-indigo flex items-center gap-3">
                <ScrollText className="w-8 h-8 text-brand-indigo" />
                <div>
                  <h4 className="font-bold text-sm tracking-wide uppercase">
                    {reportType === 'attack' 
                      ? 'Red Team Attack Report' 
                      : reportType === 'defense' 
                      ? 'Blue Team Defense Report' 
                      : 'Final Security Report'}
                  </h4>
                  <span className="text-[10px] opacity-75">Cyber Security Simulation Laboratory</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Project Name</span>
                  <p className="text-sm font-semibold text-zinc-800">{projectName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Student/Author Name</span>
                  <p className="text-sm font-semibold text-zinc-800">{studentName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Date Compiled</span>
                  <p className="text-sm font-semibold text-zinc-800">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Overall Security Score</span>
                  <p className="text-sm font-semibold text-zinc-800">{stats?.securityScore} / 100</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded bg-zinc-100 border border-zinc-200 text-[10px] leading-relaxed text-zinc-500">
              <strong>Confidentiality Notice:</strong> Controlled sandbox analysis document. Handle inside secure university simulation spaces.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
