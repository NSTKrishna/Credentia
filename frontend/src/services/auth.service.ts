import axios from 'axios';
import { AUTH_API_URL } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${AUTH_API_URL}/login`, { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await axios.post(`${AUTH_API_URL}/register`, { name, email, password });
    return response.data;
  }
};
