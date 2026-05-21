const defaultBaseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || defaultBaseUrl;

// Ensure no trailing slash so we can safely append paths
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

// Backend mounts routes under /api
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
export const AUTH_API_URL = `${API_URL}/auth`;
