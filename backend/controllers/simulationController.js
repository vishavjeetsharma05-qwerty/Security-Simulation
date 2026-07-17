import History from '../models/historyModel.js';
import { getCollection } from '../config/jsonDb.js';
import mongoose from 'mongoose';
import { isUsingJsonDb } from '../config/db.js';

const defenseSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  defenses: { type: Map, of: Boolean, default: {} },
  fixes: { type: Map, of: Boolean, default: {} }
});

const DefenseModelProxy = new Proxy({}, {
  get(target, prop) {
    const model = isUsingJsonDb()
      ? getCollection('defenses')
      : (mongoose.models.Defense || mongoose.model('Defense', defenseSchema));
    return model[prop];
  }
});

const getDefensesForUser = async (userId) => {
  let record = await DefenseModelProxy.findOne({ userId });
  if (!record) {
    record = await DefenseModelProxy.create({
      userId,
      defenses: {
        inputValidation: false,
        outputEncoding: false,
        parameterizedQueries: false,
        authSecurity: false,
        authorization: false,
        csrfProtection: false,
        xssProtection: false,
        rateLimiting: false,
        helmetSecurity: false,
        secureCookies: false,
        sessionSecurity: false,
        passwordPolicies: false,
        logging: false,
        monitoring: false
      },
      fixes: {
        sqli: false,
        xss: false,
        idor: false,
        misconfig: false,
        exposure: false
      }
    });
  }
  return record;
};

export const getDefenses = async (req, res) => {
  try {
    const record = await getDefensesForUser(req.user._id);
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleDefense = async (req, res) => {
  const { defenseName, enabled } = req.body;
  try {
    const record = await getDefensesForUser(req.user._id);
    const updatedDefenses = { ...record.defenses };
    updatedDefenses[defenseName] = enabled;
    await DefenseModelProxy.findByIdAndUpdate(record._id, { defenses: updatedDefenses });
    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'defense',
      title: `Defense Toggle: ${defenseName}`,
      details: `Defense control ${defenseName} set to ${enabled}`,
      status: 'Success',
      severity: 'Info'
    });
    res.json({ message: 'Defense status updated', defenses: updatedDefenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const runScan = async (req, res) => {
  const { targetUrl, scanType } = req.body;
  if (!targetUrl || !scanType) {
    return res.status(400).json({ message: 'Missing targetUrl or scanType' });
  }
  try {
    let outputLogs = [];
    if (scanType === 'recon') {
      outputLogs = [
        `[+] Querying WHOIS information for ${targetUrl}...`,
        `[+] IP Address detected: 198.51.100.42`,
        `[+] Registrar: CyberShield Registry LLC`,
        `[+] NS Records: ns1.simdomain.org, ns2.simdomain.org`,
        `[+] Reconnaissance gathering completed successfully.`
      ];
    } else if (scanType === 'port') {
      outputLogs = [
        `[+] Starting Port Scan on ${targetUrl} (198.51.100.42)...`,
        `[+] Port 22/tcp  - OPEN   (SSH)`,
        `[+] Port 80/tcp  - OPEN   (HTTP)`,
        `[+] Port 443/tcp - OPEN   (HTTPS)`,
        `[+] Port 3306/tcp - CLOSED (MySQL)`,
        `[+] Port scan completed.`
      ];
    } else if (scanType === 'service') {
      outputLogs = [
        `[+] Scanning services on active ports...`,
        `[+] SSH v7.6p1 Ubuntu 4ubuntu0.3 (Protocol 2.0)`,
        `[+] Nginx web server v1.14.0`,
        `[+] Service detection finished.`
      ];
    } else if (scanType === 'directory') {
      outputLogs = [
        `[+] Enumerating directories on ${targetUrl}...`,
        `[+] /admin - 302 Found (Redirect to /login)`,
        `[+] /api - 200 OK`,
        `[+] /uploads - 200 OK (Directory Listing Enabled)`,
        `[+] /config.bak - 200 OK (Sensitive exposure)`,
        `[+] Directory enumeration finished.`
      ];
    } else if (scanType === 'tech') {
      outputLogs = [
        `[+] Detecting frontend and backend technology stacks...`,
        `[+] Server Header: nginx/1.14.0`,
        `[+] Powered-By: Express.js`,
        `[+] Framework: React.js`,
        `[+] Cookies: connect.sid (Express Session)`,
        `[+] Technology detection completed.`
      ];
    }
    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'scan',
      title: `Recon Scan: ${scanType}`,
      details: `Scanned target ${targetUrl}`,
      status: 'Success',
      severity: 'Info'
    });
    res.json({ logs: outputLogs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const runExploit = async (req, res) => {
  const { vulnerability, payload } = req.body;
  if (!vulnerability || !payload) {
    return res.status(400).json({ message: 'Vulnerability and payload required' });
  }
  try {
    const record = await getDefensesForUser(req.user._id);
    let isBlocked = false;
    let blockedBy = '';
    let flag = '';
    let details = '';

    if (vulnerability === 'sqli') {
      isBlocked = record.defenses.parameterizedQueries || record.defenses.inputValidation;
      blockedBy = 'Parameterized Queries';
      flag = 'flag{sql_injection_mastered_836}';
      details = `SQL Injection exploit attempt with payload: ${payload}`;
    } else if (vulnerability === 'xss') {
      isBlocked = record.defenses.xssProtection || record.defenses.outputEncoding || record.defenses.inputValidation;
      blockedBy = 'XSS Protection Filter / Output Encoding';
      flag = 'flag{cross_site_scripting_shield_914}';
      details = `Cross-Site Scripting exploit attempt with payload: ${payload}`;
    } else if (vulnerability === 'idor') {
      isBlocked = record.defenses.authorization;
      blockedBy = 'Role-Based Access Authorization';
      flag = 'flag{idor_access_control_secured_024}';
      details = `IDOR exploit attempt with resource identifier access: ${payload}`;
    } else if (vulnerability === 'misconfig') {
      isBlocked = record.defenses.helmetSecurity;
      blockedBy = 'Helmet HTTP Security Headers';
      flag = 'flag{http_security_misconfig_hardened_472}';
      details = `Security Misconfiguration exploit attempt with headers query: ${payload}`;
    } else if (vulnerability === 'exposure') {
      isBlocked = record.defenses.secureCookies || record.defenses.sessionSecurity;
      blockedBy = 'Secure HTTPOnly Session Cookies';
      flag = 'flag{sensitive_data_exposure_protected_551}';
      details = `Sensitive Data Exposure exploit attempt for session details: ${payload}`;
    }

    if (isBlocked) {
      await History.create({
        userId: req.user._id,
        userName: req.user.name,
        type: 'simulation',
        title: `Red Team Exploit: ${vulnerability.toUpperCase()}`,
        details: `${details} - BLOCKED by ${blockedBy}`,
        status: 'Blocked',
        severity: 'High'
      });
      return res.json({
        success: false,
        message: `Exploit BLOCKED by Blue Team defense: ${blockedBy}. System is secure!`,
        logs: [
          `[!] Exploit payload received: ${payload}`,
          `[!] Checking active security controls...`,
          `[+] Found defense active: ${blockedBy}`,
          `[+] Sanitizing/blocking request. Exploit execution prevented.`
        ]
      });
    } else {
      await History.create({
        userId: req.user._id,
        userName: req.user.name,
        type: 'simulation',
        title: `Red Team Exploit: ${vulnerability.toUpperCase()}`,
        details: `${details} - SUCCEEDED (Vulnerable)`,
        status: 'Success',
        severity: 'Critical'
      });
      return res.json({
        success: true,
        message: 'Exploit SUCCEEDED! The vulnerability was successfully exploited.',
        flag,
        logs: [
          `[!] Exploit payload received: ${payload}`,
          `[!] Checking active security controls...`,
          `[-] No active security mitigation found. Proceeding with execution...`,
          `[+] Payload parsed as executable. Shell/Query response returned.`,
          `[+] Flag retrieved: ${flag}`
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const fixVulnerability = async (req, res) => {
  const { vulnerability, solved } = req.body;
  try {
    const record = await getDefensesForUser(req.user._id);
    const updatedFixes = { ...record.fixes };
    const updatedDefenses = { ...record.defenses };

    if (solved) {
      updatedFixes[vulnerability] = true;
      if (vulnerability === 'sqli') updatedDefenses.parameterizedQueries = true;
      if (vulnerability === 'xss') updatedDefenses.xssProtection = true;
      if (vulnerability === 'idor') updatedDefenses.authorization = true;
      if (vulnerability === 'misconfig') updatedDefenses.helmetSecurity = true;
      if (vulnerability === 'exposure') updatedDefenses.secureCookies = true;
    }

    await DefenseModelProxy.findByIdAndUpdate(record._id, {
      fixes: updatedFixes,
      defenses: updatedDefenses
    });

    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'defense',
      title: `Vulnerability Patched: ${vulnerability.toUpperCase()}`,
      details: `Vulnerability fixed successfully. Related safety controls enabled.`,
      status: 'Success',
      severity: 'Info'
    });

    res.json({ message: 'Vulnerability patched successfully', fixes: updatedFixes, defenses: updatedDefenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSimulationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const record = await getDefensesForUser(userId);
    const completedSimulationsCount = Object.values(record.fixes).filter(Boolean).length;
    const activeDefensesCount = Object.values(record.defenses).filter(Boolean).length;

    const scansCount = await History.countDocuments({ userId, type: 'scan' });
    const blockedAttacksCount = await History.countDocuments({ userId, type: 'simulation', status: 'Blocked' });
    const successAttacksCount = await History.countDocuments({ userId, type: 'simulation', status: 'Success' });

    let score = 30;
    score += completedSimulationsCount * 10;
    score += activeDefensesCount * 2;
    if (score > 100) score = 100;

    res.json({
      completedSimulations: completedSimulationsCount,
      activeDefenses: activeDefensesCount,
      securityScore: score,
      scansPerformed: scansCount,
      blockedAttacks: blockedAttacksCount,
      successfulAttacks: successAttacksCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
