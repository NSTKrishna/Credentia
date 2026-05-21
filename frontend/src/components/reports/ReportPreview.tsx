'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, Shield, FileText, Download } from 'lucide-react';
import { reportService } from '@/services/report.service';
import { useToast } from '@/components/ui/Toast';

interface VerificationLog {
  verificationType: string;
  verificationStatus: string;
  verifiedAt: string;
}

interface ReportPreviewProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  overallStatus: string;
  verificationLogs: VerificationLog[];
  generatedAt?: string;
}

const VerificationRow: React.FC<{ log?: VerificationLog; label: string; icon: React.ReactNode }> = ({ log, label, icon }) => {
  const status = log?.verificationStatus || 'PENDING';
  const time = log?.verifiedAt ? new Date(log.verifiedAt).toLocaleString() : 'Not verified';

  const color = status === 'VERIFIED' ? 'text-green-600' : status === 'FAILED' ? 'text-red-600' : 'text-amber-600';
  const StatusIcon = status === 'VERIFIED' ? CheckCircle : status === 'FAILED' ? XCircle : Clock;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-right">
        <div>
          <div className={`flex items-center gap-1 ${color} font-semibold text-sm justify-end`}>
            <StatusIcon className="w-4 h-4" />
            {status}
          </div>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
      </div>
    </div>
  );
};

const overallColors: Record<string, { bg: string; text: string; border: string }> = {
  VERIFIED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  FAILED:   { bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-200' },
  PARTIAL:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  PENDING:  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  candidateId,
  candidateName,
  candidateEmail,
  candidatePhone,
  overallStatus,
  verificationLogs,
  generatedAt,
}) => {
  const { addToast } = useToast();
  const colors = overallColors[overallStatus] || overallColors.PENDING;

  const aadhaarLog = verificationLogs.find((l) => l.verificationType === 'AADHAAR');
  const panLog = verificationLogs.find((l) => l.verificationType === 'PAN');

  const handleDownload = async () => {
    try {
      await reportService.downloadReport(candidateId, candidateName);
      addToast('PDF download started!', 'success');
    } catch {
      addToast('Failed to download PDF', 'error');
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="bg-[#0f172a] px-5 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">BGV Platform</p>
          <p className="text-white font-bold text-sm mt-0.5">{candidateName}</p>
        </div>
        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
          {overallStatus}
        </span>
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email</p>
            <p className="text-sm text-slate-800 font-medium mt-0.5 truncate">{candidateEmail}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Phone</p>
            <p className="text-sm text-slate-800 font-medium mt-0.5">{candidatePhone}</p>
          </div>
        </div>

        <VerificationRow log={aadhaarLog} label="Aadhaar Verification" icon={<Shield className="w-4 h-4" />} />
        <VerificationRow log={panLog} label="PAN Verification" icon={<FileText className="w-4 h-4" />} />

        {generatedAt && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Generated on {new Date(generatedAt).toLocaleString()}
          </p>
        )}

        <button
          onClick={handleDownload}
          className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download Full PDF
        </button>
      </div>
    </div>
  );
};
