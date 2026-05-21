'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { candidateService } from '@/services/candidate.service';
import { reportService } from '@/services/report.service';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { CandidateFormModal } from '@/components/candidates/CandidateFormModal';
import { VerificationTimeline } from '@/components/candidates/VerificationTimeline';
import { VerificationStepProgress } from '@/components/candidates/VerificationStepProgress';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { useVerification } from '@/hooks/useVerification';
import { useToast } from '@/components/ui/Toast';
import { 
  ArrowLeft, Edit2, Shield, FileText, CheckCircle, XCircle, 
  Clock, Play, FileDown, PlusCircle, Loader2
} from 'lucide-react';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) ?? '';

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportJustGenerated, setReportJustGenerated] = useState(false);
  const { addToast } = useToast();

  const fetchCandidate = useCallback(async () => {
    try {
      const data = await candidateService.getCandidateById(id);
      setCandidate(data);
    } catch (err: any) {
      console.error('Error fetching candidate:', err);
      setError(err.response?.data?.error || 'Failed to load candidate details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  // useVerification drives the step-by-step progress UI.
  // onComplete refreshes the candidate data once verification finishes.
  const {
    isVerifying,
    steps,
    overallStatus: verificationOverallStatus,
    error: verificationError,
    startVerification: runVerification,
  } = useVerification(fetchCandidate);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportJustGenerated(false);
    try {
      await reportService.generateReport(id);
      addToast('Report generated — click Download PDF to save it', 'success');
      setReportJustGenerated(true);
      fetchCandidate(); // Refresh to update report data in candidate object
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Failed to generate report', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await reportService.downloadReport(id, candidate?.fullName);
      addToast('PDF download started!', 'success');
    } catch {
      addToast('Failed to download PDF', 'error');
    }
  };

  const maskAadhaar = (num: string) => {
    if (!num || num.length < 12) return num;
    return `XXXX-XXXX-${num.slice(-4)}`;
  };

  const maskPAN = (pan: string) => {
    if (!pan || pan.length < 10) return pan;
    return `${pan.slice(0, 2)}XXXXX${pan.slice(-3)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
          <div>
            <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-48"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[380px]">
              <div className="h-14 border-b border-slate-100 bg-slate-50 rounded-t-xl"></div>
              <div className="p-6 space-y-6">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-10 bg-slate-200 rounded w-full mt-8"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[220px]">
              <div className="h-14 border-b border-slate-100 bg-slate-50 rounded-t-xl"></div>
              <div className="p-6 flex flex-col items-center justify-center h-full">
                <div className="w-14 h-14 rounded-full bg-slate-200 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[480px]">
              <div className="h-14 border-b border-slate-100 bg-slate-50 rounded-t-xl"></div>
              <div className="p-6 border-b border-slate-100 flex justify-center py-10">
                <div className="w-32 h-10 bg-slate-200 rounded-full"></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-14 bg-slate-200 rounded-lg w-full"></div>
                <div className="h-14 bg-slate-200 rounded-lg w-full"></div>
              </div>
              <div className="p-6">
                <div className="h-12 bg-slate-200 rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl flex flex-col items-center justify-center min-h-[40vh]">
        <XCircle className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Candidate Not Found</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/candidates')}
          className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          &larr; Back to Candidates
        </button>
      </div>
    );
  }

  // Determine latest Aadhaar and PAN status from logs if available
  const aadhaarLog = candidate.verificationLogs?.find((l: any) => l.verificationType === 'AADHAAR');
  const panLog = candidate.verificationLogs?.find((l: any) => l.verificationType === 'PAN');

  const renderStatusRow = (label: string, icon: React.ReactNode, log: any) => {
    const status = log?.verificationStatus || 'PENDING';
    const timestamp = log?.verifiedAt ? new Date(log.verifiedAt).toLocaleString() : 'Not verified';
    
    let Icon = Clock;
    let colorClass = 'text-amber-500';
    if (status === 'VERIFIED') {
      Icon = CheckCircle;
      colorClass = 'text-green-500';
    } else if (status === 'FAILED') {
      Icon = XCircle;
      colorClass = 'text-red-500';
    }

    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 border border-slate-200">
            {icon}
          </div>
          <span className="font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${colorClass}`}>{status}</span>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
          <span className="text-xs text-slate-400 mt-0.5">{timestamp}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/candidates')}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{candidate.fullName}</h1>
          <p className="text-slate-500 mt-1">Candidate Profile & Verification Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info & Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section 1: Personal Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <button 
                onClick={() => setIsEditOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-800 font-medium">{candidate.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Phone</p>
                <p className="text-slate-800 font-medium">{candidate.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="text-slate-800 font-medium">{new Date(candidate.dob).toLocaleDateString()}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Aadhaar</p>
                  <p className="text-slate-800 font-mono text-sm">{maskAadhaar(candidate.aadhaarNumber)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">PAN</p>
                  <p className="text-slate-800 font-mono text-sm">{maskPAN(candidate.panNumber)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Address</p>
                <p className="text-slate-800 text-sm leading-relaxed">{candidate.address}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Report Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <FileDown className="w-4 h-4 mr-2 text-indigo-600" />
                Final Report
              </h2>
            </div>
            <div className="p-5">
              {/* Generating state: animated dots */}
              {isGeneratingReport && (
                <div className="flex flex-col items-center gap-3 py-6 animate-in fade-in duration-200">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm font-medium text-slate-600">
                    Generating PDF
                    <span className="inline-flex">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </span>
                  </p>
                </div>
              )}

              {/* Show ReportPreview once report exists or was just generated */}
              {!isGeneratingReport && (candidate.report || reportJustGenerated) && (
                <ReportPreview
                  candidateId={id}
                  candidateName={candidate.fullName}
                  candidateEmail={candidate.email}
                  candidatePhone={candidate.phone}
                  overallStatus={candidate.status}
                  verificationLogs={candidate.verificationLogs || []}
                  generatedAt={candidate.report?.generatedAt}
                />
              )}

              {/* No report yet */}
              {!isGeneratingReport && !candidate.report && !reportJustGenerated && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <p className="text-sm text-slate-500">No report has been generated yet.</p>
                  <button
                    onClick={handleGenerateReport}
                    disabled={candidate.status === 'PENDING'}
                    className="w-full py-2 px-4 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Generate Report
                  </button>
                  {candidate.status === 'PENDING' && (
                    <p className="text-xs text-amber-600">Complete verification to generate a report.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Verification & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 2: Verification Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Verification Status
              </h2>
            </div>
            
            <div className="p-6 border-b border-slate-100 flex flex-col items-center justify-center py-8">
              <p className="text-sm text-slate-500 uppercase tracking-wider font-medium mb-3">Overall Status</p>
              <div className="scale-150 origin-center">
                <StatusBadge status={candidate.status} />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {renderStatusRow('Aadhaar Verification', <Shield className="w-4 h-4" />, aadhaarLog)}
              {renderStatusRow('PAN Verification', <FileText className="w-4 h-4" />, panLog)}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              {isVerifying || verificationOverallStatus ? (
                <VerificationStepProgress
                  steps={steps}
                  overallStatus={verificationOverallStatus}
                  error={verificationError}
                />
              ) : (
                <button
                  onClick={() => runVerification(id)}
                  disabled={candidate.status === 'VERIFIED'}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center shadow-sm transition-all ${
                    candidate.status === 'VERIFIED'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {candidate.status === 'VERIFIED' ? 'Verification Completed' : 'Start Verification'}
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Verification Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-semibold text-slate-800 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-slate-500" />
                Verification Timeline
              </h2>
            </div>
            <div className="p-6">
              <VerificationTimeline logs={candidate.verificationLogs || []} />
            </div>
          </div>

        </div>
      </div>

      <CandidateFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        candidateToEdit={candidate}
        onSuccess={() => {
          setIsEditOpen(false);
          fetchCandidate();
        }}
      />
    </div>
  );
}
