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

  generateReport: async (candidateId: string) => {
    const response = await axios.post(`${API_URL}/reports/${candidateId}/generate`, {}, getAuthHeaders());
    return response.data;
  },

  downloadReport: async (candidateId: string) => {
    const response = await axios.get(`${API_URL}/reports/${candidateId}`, {
      ...getAuthHeaders(),
      responseType: 'blob', // Required to receive binary PDF data
    });
    // Create a temporary URL and trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bgv-report-${candidateId.slice(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
