import { Injectable } from '@nestjs/common';

import type { ReportData, ReportFinding } from './types/report-data.type';

@Injectable()
export class ReportRendererService {
  render(report: ReportData): string {
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Kodeye Security Audit Report</title><style>${styles}</style></head>
<body><main>
<header><div><p class="eyebrow">KODEYE SECURITY AUDIT REPORT</p><h1>${escapeHtml(report.repository.fullName ?? report.repository.name)}</h1>
<p>${escapeHtml(report.summary.executiveSummary)}</p></div><span class="risk ${report.summary.riskLevel.toLowerCase()}">${report.summary.riskLevel} RISK</span></header>
<section class="meta">${meta('Scan status', report.metadata.scanStatus)}${meta('Branch', report.metadata.branch ?? report.repository.defaultBranch)}${meta('Generated', formatDate(report.metadata.generatedAt))}${meta('Organization', report.organization.name)}</section>
<section><h2>Executive Summary</h2><p>${escapeHtml(report.summary.executiveSummary)}</p><p class="disclaimer">${escapeHtml(report.disclaimer)}</p></section>
<section><h2>Severity Overview</h2><div class="counts">${count('Critical', report.summary.critical, 'critical')}${count('High', report.summary.high, 'high')}${count('Medium', report.summary.medium, 'medium')}${count('Low', report.summary.low, 'low')}${count('Info', report.summary.info, 'info')}</div></section>
<section><h2>Scanner Coverage</h2>${report.scannerSummary.length ? `<div class="scanner-grid">${report.scannerSummary.map((item) => `<div class="card"><strong>${escapeHtml(item.scanner)}</strong><span>${escapeHtml(item.status)}</span><p>${escapeHtml(item.coverage)}</p><b>${item.total} findings</b></div>`).join('')}</div>` : '<p>No scanner execution metadata is available for this scan.</p>'}</section>
<section><h2>Findings Detail</h2>${report.findings.length ? report.findings.map(renderFinding).join('') : '<div class="empty">No findings detected by enabled scanners. This does not guarantee the codebase is vulnerability-free.</div>'}</section>
<section><h2>Recommended Priorities</h2>${report.recommendations.length ? `<ol>${report.recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>` : '<p>Review scanner coverage and continue with manual verification.</p>'}</section>
<section><h2>Scan Logs Summary</h2>${report.scanLogsSummary.length ? `<table><thead><tr><th>Time</th><th>Level</th><th>Event</th></tr></thead><tbody>${report.scanLogsSummary.map((log) => `<tr><td>${formatDate(log.createdAt)}</td><td>${escapeHtml(log.level)}</td><td>${escapeHtml(log.message)}</td></tr>`).join('')}</tbody></table>` : '<p>No scan logs are available.</p>'}</section>
<footer>${escapeHtml(report.disclaimer)}<br>Report ID: ${escapeHtml(report.metadata.reportId)}</footer>
</main></body></html>`;
  }
}

function renderFinding(finding: ReportFinding): string {
  return `<article class="finding"><div class="finding-head"><span class="severity ${finding.severity.toLowerCase()}">${finding.severity}</span><span>${escapeHtml(finding.scanner)}</span><span>${escapeHtml(finding.category)}</span></div>
<h3>${escapeHtml(finding.title)}</h3>${paragraph(finding.description)}
${finding.filePath ? `<p class="location">${escapeHtml(finding.filePath)}${finding.lineStart ? `:${finding.lineStart}` : ''}</p>` : ''}
${finding.evidenceMasked ? `<pre>${escapeHtml(finding.evidenceMasked)}</pre>` : ''}
<div class="detail-grid">${meta('CWE', finding.cwe ?? 'Not provided')}${meta('OWASP', finding.owasp ?? 'Not provided')}${meta('Confidence', finding.confidence)}${meta('Status', finding.status)}</div>
${finding.impact ? `<h4>Impact</h4>${paragraph(finding.impact)}` : ''}${finding.recommendation ? `<div class="recommendation"><strong>Recommendation</strong>${paragraph(finding.recommendation)}</div>` : ''}</article>`;
}

function paragraph(value: string | null): string {
  return value ? `<p>${escapeHtml(value)}</p>` : '';
}

function meta(label: string, value: string): string {
  return `<div class="meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function count(label: string, value: number, tone: string): string {
  return `<div class="count ${tone}"><span>${label}</span><strong>${value}</strong></div>`;
}

function formatDate(value: string): string {
  return new Date(value).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ] ?? character,
  );
}

const styles = `
@page{size:A4;margin:18mm 15mm}*{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;font-size:13px;line-height:1.55}main{max-width:960px;margin:0 auto;padding:32px}header{display:flex;justify-content:space-between;gap:24px;padding:30px;border:1px solid #e2e8f0;border-radius:18px;background:linear-gradient(135deg,#fff,#eef2ff)}h1{font-size:30px;margin:6px 0 12px}h2{font-size:19px;border-bottom:1px solid #e2e8f0;padding-bottom:8px}h3{font-size:16px;margin:12px 0 4px}h4{margin-bottom:2px}.eyebrow{color:#4f46e5;font-size:11px;font-weight:bold;letter-spacing:1.5px}.risk,.severity{display:inline-block;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:bold;height:max-content}.risk{background:#eef2ff;color:#4338ca}.risk.critical,.severity.critical{background:#fee2e2;color:#b91c1c}.risk.high,.severity.high{background:#ffedd5;color:#c2410c}.risk.medium,.severity.medium{background:#fef3c7;color:#a16207}.risk.low,.severity.low{background:#dbeafe;color:#1d4ed8}.risk.unknown,.severity.unknown,.severity.info{background:#e2e8f0;color:#475569}section{margin-top:24px;padding:22px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;break-inside:avoid}.meta,.counts,.scanner-grid,.detail-grid{display:grid;gap:10px}.meta{grid-template-columns:repeat(4,1fr);margin-top:16px}.counts{grid-template-columns:repeat(5,1fr)}.scanner-grid{grid-template-columns:repeat(3,1fr)}.detail-grid{grid-template-columns:repeat(4,1fr);margin-top:12px}.meta-item,.card,.count{padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}.meta-item span,.count span{display:block;color:#64748b;font-size:11px}.count strong{font-size:22px}.finding{margin-top:14px;padding:18px;border:1px solid #e2e8f0;border-left:4px solid #6366f1;border-radius:12px;break-inside:avoid}.finding-head{display:flex;gap:8px;align-items:center;color:#64748b;font-size:11px}.location{font-family:monospace;color:#475569}pre{white-space:pre-wrap;word-break:break-word;background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;font-size:11px}.recommendation,.disclaimer,.empty{padding:12px;border-radius:10px;background:#eef2ff;color:#312e81}.disclaimer{background:#f1f5f9;color:#475569}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:11px}footer{margin-top:24px;color:#64748b;font-size:10px;text-align:center}@media(max-width:700px){main{padding:14px}header{display:block}.meta,.counts,.scanner-grid,.detail-grid{grid-template-columns:1fr 1fr}.risk{margin-top:12px}}`;
