import { useState, useEffect, useCallback } from 'react';
import { candidateService } from '@/services/candidate.service';

export const useCandidates = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
      };
      
      const response = await candidateService.getCandidates(params);
      setData(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching candidates:', err);
      setError(err.response?.data?.error || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    page,
    limit,
    search,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    refresh: fetchCandidates,
  };
};
