import { maskAadhaar, maskPAN } from '../utils/masks';

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  address: string;
  aadhaarNumber: string;
  panNumber: string;
  status: string;
}

interface VerificationLog {
  verificationType: string;
  verificationStatus: string;
  responsePayload: any;
  verifiedAt: Date;
}

interface GeneratedBy {
  name: string;
  email: string;
}

const statusBadge = (status: string): string => {
  const isVerified = status === 'VERIFIED';
  const color = isVerified ? '#15803d' : '#dc2626';
  const bg = isVerified ? '#dcfce7' : '#fee2e2';
  return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${bg};color:${color};font-weight:700;font-size:13px;letter-spacing:0.05em;">${status}</span>`;
};

const overallBadge = (status: string): string => {
  const colorMap: Record<string, { bg: string; color: string }> = {
    VERIFIED: { bg: '#dcfce7', color: '#15803d' },
    FAILED:   { bg: '#fee2e2', color: '#dc2626' },
    PARTIAL:  { bg: '#ffedd5', color: '#c2410c' },
    PENDING:  { bg: '#fef9c3', color: '#854d0e' },
  };
  const { bg, color } = colorMap[status] || colorMap.PENDING;
  return `<span style="display:inline-block;padding:8px 28px;border-radius:30px;background:${bg};color:${color};font-weight:800;font-size:20px;letter-spacing:0.08em;">${status}</span>`;
};

const row = (label: string, value: string): string => `
  <tr>
    <td style="padding:7px 12px;color:#64748b;font-size:13px;font-weight:600;white-space:nowrap;width:180px;">${label}</td>
    <td style="padding:7px 12px;color:#0f172a;font-size:13px;">${value}</td>
  </tr>`;

const divider = `<div style="border-top:1px solid #e2e8f0;margin:24px 0;"></div>`;

export const generateReportHTML = (
  candidate: Candidate,
  verificationLogs: VerificationLog[],
  generatedBy: GeneratedBy
): string => {
  const reportId = `BGV-${candidate.id.slice(0, 8).toUpperCase()}`;
  const generatedDate = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
  const dob = new Date(candidate.dob).toLocaleDateString('en-IN', { dateStyle: 'long' });

  const aadhaarLog = verificationLogs.find((l) => l.verificationType === 'AADHAAR');
  const panLog = verificationLogs.find((l) => l.verificationType === 'PAN');

  const aadhaarPayload = aadhaarLog?.responsePayload || {};
  const panPayload = panLog?.responsePayload || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BGV Report — ${candidate.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body style="padding: 0; margin: 0;">

  <!-- Header -->
  <div style="background:#0f172a;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:0.1em;">BGV PLATFORM</div>
      <div style="color:#94a3b8;font-size:11px;margin-top:3px;letter-spacing:0.05em;">BACKGROUND VERIFICATION SERVICES</div>
    </div>
    <div style="text-align:right;">
      <div style="color:#94a3b8;font-size:11px;letter-spacing:0.1em;font-weight:700;">BACKGROUND VERIFICATION REPORT</div>
      <div style="color:#e2e8f0;font-size:11px;margin-top:4px;">CONFIDENTIAL DOCUMENT</div>
    </div>
  </div>

  <!-- Report Meta -->
  <div style="background:#f8fafc;padding:16px 40px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <span style="font-size:12px;color:#64748b;font-weight:600;">REPORT ID: </span>
      <span style="font-size:12px;color:#0f172a;font-weight:700;font-family:monospace;">${reportId}</span>
    </div>
    <div>
      <span style="font-size:12px;color:#64748b;font-weight:600;">GENERATED ON: </span>
      <span style="font-size:12px;color:#0f172a;font-weight:700;">${generatedDate}</span>
    </div>
    <div>
      <span style="font-size:12px;color:#64748b;font-weight:600;">VERIFIED BY: </span>
      <span style="font-size:12px;color:#0f172a;font-weight:700;">${generatedBy.name}</span>
    </div>
  </div>

  <div style="padding: 32px 40px;">

    <!-- Section: Candidate Information -->
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;">
        01 — Candidate Information
      </div>
      <table>
        ${row('Full Name', candidate.fullName)}
        ${row('Email Address', candidate.email)}
        ${row('Phone Number', candidate.phone)}
        ${row('Date of Birth', dob)}
        ${row('Address', candidate.address)}
        ${row('Aadhaar Number', maskAadhaar(candidate.aadhaarNumber))}
        ${row('PAN Number', maskPAN(candidate.panNumber))}
      </table>
    </div>

    ${divider}

    <!-- Section: Aadhaar Verification -->
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;">
        02 — Aadhaar Verification
      </div>
      ${aadhaarLog ? `
        <table>
          ${row('Verification Status', statusBadge(aadhaarLog.verificationStatus))}
          ${row('Name Match', aadhaarPayload.nameMatch === true ? '✓ Match Confirmed' : aadhaarPayload.nameMatch === false ? '✗ Mismatch' : 'N/A')}
          ${row('DOB Match', aadhaarPayload.dobMatch === true ? '✓ Match Confirmed' : aadhaarPayload.dobMatch === false ? '✗ Mismatch' : 'N/A')}
          ${row('Message', aadhaarPayload.message || '—')}
          ${row('Verified At', new Date(aadhaarLog.verifiedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}
        </table>` 
      : `<p style="color:#94a3b8;font-size:13px;font-style:italic;">Aadhaar verification not yet performed.</p>`}
    </div>

    ${divider}

    <!-- Section: PAN Verification -->
    <div style="margin-bottom:8px;">
      <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:14px;">
        03 — PAN Verification
      </div>
      ${panLog ? `
        <table>
          ${row('Verification Status', statusBadge(panLog.verificationStatus))}
          ${row('PAN Card Status', panPayload.panStatus || '—')}
          ${row('Message', panPayload.message || '—')}
          ${row('Verified At', new Date(panLog.verifiedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}
        </table>`
      : `<p style="color:#94a3b8;font-size:13px;font-style:italic;">PAN verification not yet performed.</p>`}
    </div>

    ${divider}

    <!-- Section: Overall Status -->
    <div style="text-align:center;padding:24px 0;">
      <div style="font-size:11px;font-weight:800;color:#64748b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">
        Overall Verification Result
      </div>
      ${overallBadge(candidate.status)}
    </div>

    ${divider}

    <!-- Footer -->
    <div style="margin-top:24px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <p style="font-size:11px;color:#94a3b8;">This report was generated by <strong>BGV Platform</strong> on ${generatedDate}.</p>
          <p style="font-size:11px;color:#94a3b8;margin-top:4px;">This is a system-generated report and does not require a physical signature.</p>
        </div>
        <div style="text-align:right;">
          <p style="font-size:11px;color:#94a3b8;margin-bottom:24px;">Authorised Signatory</p>
          <div style="border-bottom:1px solid #cbd5e1;width:180px;margin-left:auto;"></div>
          <p style="font-size:10px;color:#cbd5e1;margin-top:4px;">Digital Signature</p>
        </div>
      </div>
      <div style="margin-top:20px;text-align:center;border-top:1px solid #f1f5f9;padding-top:14px;">
        <p style="font-size:10px;color:#cbd5e1;">BGV Platform · Confidential · Report ID: ${reportId}</p>
      </div>
    </div>

  </div>
</body>
</html>`;
};
