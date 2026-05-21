import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { API_URL } from './api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const reportService = {
  listReports: async () => {
    const response = await axios.get(`${API_URL}/reports`, getAuthHeaders());
    return response.data;
  },

  generateReport: async (candidateId: string) => {
    const response = await axios.post(`${API_URL}/reports/${candidateId}/generate`, {}, getAuthHeaders());
    return response.data; // { reportId, generatedAt }
  },

  downloadReport: async (candidateId: string, candidateName?: string) => {
    // Open backend download endpoint in a new tab — browser will follow redirects to Cloudinary.
    if (typeof window !== 'undefined') {
      const downloadUrl = `${API_URL}/reports/${candidateId}`;
      window.open(downloadUrl, '_blank');
    } else {
      // Fallback for non-browser environments: attempt an axios request (not typical)
      const response = await axios.get(`${API_URL}/reports/${candidateId}`, {
        ...getAuthHeaders(),
        responseType: 'blob',
      });
      const fileName = candidateName
        ? `bgv-report-${candidateName.replace(/\s+/g, '-').toLowerCase()}.pdf`
        : `bgv-report-${candidateId.slice(0, 8)}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  },
};
