import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // allow sending cookies if backend uses them
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    try {
      token = localStorage.getItem('auth_token');
    } catch {
      token = null;
    }
    // Fallback: read cookie if localStorage not available
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )AUTH_TOKEN=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
