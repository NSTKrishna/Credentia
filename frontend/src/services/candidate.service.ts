import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const candidateService = {
  getCandidates: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await axios.get(`${API_URL}/candidates`, {
      ...getAuthHeaders(),
      params,
    });
    return response.data;
  },

  getCandidateById: async (id: string) => {
    const response = await axios.get(`${API_URL}/candidates/${id}`, getAuthHeaders());
    return response.data;
  },

  createCandidate: async (data: any) => {
    const response = await axios.post(`${API_URL}/candidates`, data, getAuthHeaders());
    return response.data;
  },

  updateCandidate: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/candidates/${id}`, data, getAuthHeaders());
    return response.data;
  },

  deleteCandidate: async (id: string) => {
    const response = await axios.delete(`${API_URL}/candidates/${id}`, getAuthHeaders());
    return response.data;
  },
  
  startVerification: async (id: string) => {
    const response = await axios.post(`${API_URL}/verifications/${id}/start`, {}, getAuthHeaders());
    return response.data;
  },
};
