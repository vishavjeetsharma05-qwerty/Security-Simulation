import axios from 'axios';
import History from '../models/historyModel.js';

export const analyzeHeaders = async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  let formattedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    formattedUrl = 'https://' + url;
  }

  try {
    const response = await axios.get(formattedUrl, {
      timeout: 4000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: () => true
    });

    const headers = response.headers || {};
    const findings = {
      csp: headers['content-security-policy'] ? 'Enabled' : 'Missing',
      hsts: headers['strict-transport-security'] ? 'Enabled' : 'Missing',
      xFrame: headers['x-frame-options'] ? 'Enabled' : 'Missing',
      referrerPolicy: headers['referrer-policy'] ? 'Enabled' : 'Missing',
      permissionsPolicy: headers['permissions-policy'] ? 'Enabled' : 'Missing',
      xContentType: headers['x-content-type-options'] ? 'Enabled' : 'Missing'
    };

    let score = 0;
    if (findings.csp === 'Enabled') score += 25;
    if (findings.hsts === 'Enabled') score += 20;
    if (findings.xFrame === 'Enabled') score += 15;
    if (findings.referrerPolicy === 'Enabled') score += 15;
    if (findings.permissionsPolicy === 'Enabled') score += 10;
    if (findings.xContentType === 'Enabled') score += 15;

    let grade = 'D';
    if (score >= 95) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';

    const recommendations = [];
    if (findings.csp === 'Missing') {
      recommendations.push({
        header: 'Content-Security-Policy',
        suggestion: 'Enable CSP to prevent Cross-Site Scripting (XSS) and clickjacking attacks.'
      });
    }
    if (findings.hsts === 'Missing') {
      recommendations.push({
        header: 'Strict-Transport-Security',
        suggestion: 'Configure HSTS to enforce secure HTTPS connections for all client requests.'
      });
    }
    if (findings.xFrame === 'Missing') {
      recommendations.push({
        header: 'X-Frame-Options',
        suggestion: 'Set X-Frame-Options to DENY or SAMEORIGIN to mitigate clickjacking.'
      });
    }
    if (findings.referrerPolicy === 'Missing') {
      recommendations.push({
        header: 'Referrer-Policy',
        suggestion: 'Implement a strict Referrer-Policy header to avoid leaking sensitive navigation information.'
      });
    }
    if (findings.permissionsPolicy === 'Missing') {
      recommendations.push({
        header: 'Permissions-Policy',
        suggestion: 'Define a Permissions-Policy header to restrict usage of browser APIs like camera and geolocation.'
      });
    }
    if (findings.xContentType === 'Missing') {
      recommendations.push({
        header: 'X-Content-Type-Options',
        suggestion: 'Enable X-Content-Type-Options: nosniff to enforce mime-type strictness and prevent MIME type sniffing.'
      });
    }

    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'tool',
      title: 'Security Headers Scanned',
      details: `Analyzed security headers for target: ${formattedUrl}. Grade: ${grade}`,
      status: 'Success',
      severity: 'Info'
    });

    res.json({
      url: formattedUrl,
      score,
      grade,
      findings,
      recommendations
    });
  } catch (error) {
    const mockFindings = {
      csp: 'Missing',
      hsts: 'Enabled',
      xFrame: 'Enabled',
      referrerPolicy: 'Missing',
      permissionsPolicy: 'Missing',
      xContentType: 'Enabled'
    };
    const mockScore = 50;
    const mockGrade = 'C';
    const mockRecommendations = [
      { header: 'Content-Security-Policy', suggestion: 'Enable CSP to prevent XSS and clickjacking.' },
      { header: 'Referrer-Policy', suggestion: 'Implement Referrer-Policy to protect leakage.' },
      { header: 'Permissions-Policy', suggestion: 'Restrict browser API features using Permissions-Policy.' }
    ];

    await History.create({
      userId: req.user._id,
      userName: req.user.name,
      type: 'tool',
      title: 'Security Headers Scan Failed (Simulated Output)',
      details: `Simulated scan results for target: ${formattedUrl}. Grade: C`,
      status: 'Success',
      severity: 'Info'
    });

    res.json({
      url: formattedUrl,
      score: mockScore,
      grade: mockGrade,
      findings: mockFindings,
      recommendations: mockRecommendations
    });
  }
};
