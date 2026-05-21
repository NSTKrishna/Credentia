'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Download, RefreshCw, FileSearch } from 'lucide-react';
import { reportService } from '@/services/report.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.listReports();
      setReports(data);
    } catch {
      addToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleDownload = async (report: any) => {
    try {
      await reportService.downloadReport(report.candidateId, report.candidate?.fullName);
      addToast('PDF download started!', 'success');
    } catch {
      addToast('Failed to download PDF', 'error');
    }
  };

  const handleRegenerate = async (report: any) => {
    setActionId(report.candidateId);
    try {
      await reportService.generateReport(report.candidateId);
      addToast('Report regenerated successfully!', 'success');
      fetchReports();
    } catch {
      addToast('Failed to regenerate report', 'error');
    } finally {
      setActionId(null);
    }
  };

  const isOlderThan24h = (date: string) => {
    return new Date().getTime() - new Date(date).getTime() > 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">Download and manage all generated verification reports.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Overall Status</th>
                <th className="px-6 py-4">Aadhaar</th>
                <th className="px-6 py-4">PAN</th>
                <th className="px-6 py-4">Generated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-28 ml-auto"></div></td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                        <FileSearch className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">No reports yet. Verify a candidate first.</p>
                      <Link
                        href="/candidates"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Go to Candidates &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => {
                  const logs: any[] = report.candidate?.verificationLogs || [];
                  const aadhaarLog = logs.find((l: any) => l.verificationType === 'AADHAAR');
                  const panLog = logs.find((l: any) => l.verificationType === 'PAN');
                  const canRegenerate = isOlderThan24h(report.generatedAt);

                  return (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{report.candidate?.fullName}</div>
                        <div className="text-xs text-slate-400">{report.candidate?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.candidate?.status} />
                      </td>
                      <td className="px-6 py-4">
                        {aadhaarLog ? <StatusBadge status={aadhaarLog.verificationStatus} /> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {panLog ? <StatusBadge status={panLog.verificationStatus} /> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handleDownload(report)}
                            title="Download PDF"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                          <button
                            onClick={() => handleRegenerate(report)}
                            disabled={!canRegenerate || actionId === report.candidateId}
                            title={!canRegenerate ? 'Can only regenerate after 24 hours' : 'Regenerate PDF'}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {actionId === report.candidateId ? (
                              <Spinner size="sm" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            Regenerate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
