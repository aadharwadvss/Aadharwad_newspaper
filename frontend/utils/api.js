import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('adminToken');
      if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== PUBLIC API ====================

export const publicAPI = {
  // Get today's newspaper
  getToday: async () => {
    const response = await api.get('/newspaper/today');
    return response.data;
  },

  // Get latest newspaper (most recent upload)
  getLatest: async () => {
    const response = await api.get('/newspaper/latest');
    return response.data;
  },

  // Get newspaper by date
  getByDate: async (date) => {
    const response = await api.get(`/newspaper/date/${date}`);
    return response.data;
  },

  // Get all newspapers
  getAll: async (page = 1, limit = 50) => {
    const response = await api.get(`/newspaper/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get newspapers by month
  getByMonth: async (yearMonth) => {
    const response = await api.get(`/newspaper/month/${yearMonth}`);
    return response.data;
  }
};

// ==================== ADMIN API ====================

export const adminAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    if (response.data.success && response.data.token) {
      Cookies.set('adminToken', response.data.token, { expires: 7 });
    }
    return response.data;
  },

  // Verify token
  verify: async () => {
    const response = await api.get('/admin/verify');
    return response.data;
  },

  // Logout
  logout: () => {
    Cookies.remove('adminToken');
  },

  // Upload newspaper
  uploadNewspaper: async (file, date, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);

    const response = await api.post('/admin/newspaper/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  // Delete newspaper
  deleteNewspaper: async (id) => {
    const response = await api.delete(`/admin/newspaper/${id}`);
    return response.data;
  },

  // Get upload history
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/newspaper/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/admin/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

// ==================== HELPER FUNCTIONS ====================

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('mr-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export default api;
