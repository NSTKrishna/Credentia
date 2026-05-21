'use client';

import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface VerificationLog {
  id: string;
  verificationType: string;
  verificationStatus: string;
  requestPayload: any;
  responsePayload: any;
  verifiedAt: string;
}

export const VerificationTimeline: React.FC<{ logs: VerificationLog[] }> = ({ logs }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!logs || logs.length === 0) {
    return <p className="text-sm text-slate-500 italic">No verification history found.</p>;
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {logs.map((log) => {
        const isExpanded = expandedId === log.id;
        const Icon = log.verificationType === 'AADHAAR' ? Shield : FileText;
        
        return (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {log.verificationType} Verification
                  </span>
                  {getStatusIcon(log.verificationStatus)}
                </div>
                <time className="text-xs text-slate-400 font-medium">
                  {new Date(log.verifiedAt).toLocaleString()}
                </time>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">
                Status: <span className="font-semibold">{log.verificationStatus}</span>
              </p>
              
              <button 
                onClick={() => toggleExpand(log.id)}
                className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isExpanded ? (
                  <><ChevronUp className="w-3 h-3 mr-1" /> Hide Payload</>
                ) : (
                  <><ChevronDown className="w-3 h-3 mr-1" /> View Payload</>
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                    <pre className="text-[11px] text-green-400 font-mono">
                      {JSON.stringify({ request: log.requestPayload, response: log.responsePayload }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
