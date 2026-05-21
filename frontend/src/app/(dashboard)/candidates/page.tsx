'use client';

import React, { useState, useEffect } from 'react';
import { useCandidates } from '@/hooks/useCandidates';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CandidateFormModal } from '@/components/candidates/CandidateFormModal';
import { DeleteConfirmModal } from '@/components/candidates/DeleteConfirmModal';
import { candidateService } from '@/services/candidate.service';
import { Plus, Search, Eye, Play, Trash2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const {
    data,
    total,
    totalPages,
    loading,
    page,
    limit,
    status,
    setPage,
    setSearch,
    setStatus,
    refresh,
  } = useCandidates();

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setSearch, setPage]);

  const handleDeleteClick = (candidate: any) => {
    setCandidateToDelete({ id: candidate.id, name: candidate.fullName });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    try {
      await candidateService.deleteCandidate(candidateToDelete.id);
      setIsDeleteOpen(false);
      setCandidateToDelete(null);
      refresh();
    } catch (error) {
      console.error('Error deleting candidate', error);
      alert('Failed to delete candidate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartVerification = async (id: string) => {
    setVerifyingId(id);
    try {
      await candidateService.startVerification(id);
      refresh();
    } catch (error) {
      console.error('Error starting verification', error);
      alert('Failed to start verification');
    } finally {
      setVerifyingId(null);
    }
  };

  // Pagination bounds
  const startResult = (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Candidates</h1>
          <p className="text-slate-500 mt-1">Manage and verify candidate backgrounds.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Candidate
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="FAILED">Failed</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Aadhaar</th>
                <th className="px-6 py-4">PAN</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                // Skeleton Loader (5 rows)
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <ShieldCheck className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-1">No candidates yet</h3>
                      <p className="text-slate-500 mb-6">Get started by adding your first candidate for verification.</p>
                      <button
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Candidate
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{candidate.fullName}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{candidate.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{candidate.phone}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm">{candidate.aadhaarNumber}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm uppercase">{candidate.panNumber}</td>
                    <td className="px-6 py-4"><StatusBadge status={candidate.status} /></td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      
                      {candidate.status === 'PENDING' && (
                        <button
                          onClick={() => handleStartVerification(candidate.id)}
                          disabled={verifyingId === candidate.id}
                          className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          title="Start Verification"
                        >
                          {verifyingId === candidate.id ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteClick(candidate)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{startResult}</span> to{' '}
              <span className="font-medium text-slate-700">{endResult}</span> of{' '}
              <span className="font-medium text-slate-700">{total}</span> results
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CandidateFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          setIsFormOpen(false);
          refresh();
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        candidateName={candidateToDelete?.name || ''}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
