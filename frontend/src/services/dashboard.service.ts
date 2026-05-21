import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from './api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const dashboardService = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
    return response.data;
  },

  getRecentCandidates: async () => {
    // limit=5 to get the most recent candidates
    const response = await axios.get(`${API_URL}/candidates?limit=5`, getAuthHeaders());
    return response.data;
  },
};
