'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { Users, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { dashboardService } from '@/services/dashboard.service';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, candidatesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentCandidates(),
        ]);
        setStats(statsData);
        setRecentCandidates(candidatesData.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here is the latest snapshot of your background verifications.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Candidates"
          value={stats?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Verified"
          value={stats?.verified || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Failed"
          value={stats?.failed || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Recent Candidates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Recent Candidates</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-100">Name</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">Email</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">Status</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100">Date Added</th>
                <th className="px-6 py-4 font-medium border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{candidate.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {candidate.email}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={candidate.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Link href="/candidates" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View all candidates &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
