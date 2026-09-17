import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Admin axios instance with cookie credentials
const adminAxios = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Request interceptor: attach Bearer token as fallback for export URLs
adminAxios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-redirect on 401
adminAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminAuth');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// ── Public APIs ──────────────────────────────────────────────────

export const poemsApi = {
  getAll: async (sort = 'newest') => {
    const response = await axios.get(`${API}/poems?sort=${sort}`);
    return response.data.poems;
  },

  getBySlug: async (slug) => {
    const response = await axios.get(`${API}/poems/slug/${slug}`);
    return response.data.poem || response.data;
  },

  ratePoem: async (poemId, rating) => {
    const response = await axios.post(`${API}/poems/${poemId}/rate`, { rating });
    return response.data;
  },

  getComments: async (poemId) => {
    const response = await axios.get(`${API}/poems/${poemId}/comments`);
    return response.data;
  },

  addComment: async (poemId, author, content) => {
    const response = await axios.post(`${API}/poems/${poemId}/comments`, { author, content });
    return response.data;
  },

  search: async (query) => {
    const response = await axios.get(`${API}/poems?search=${encodeURIComponent(query)}`);
    return response.data.poems || response.data;
  },

  getPoemOfTheDay: async () => {
    const response = await axios.get(`${API}/poem-of-the-day`);
    return response.data.poem || response.data;
  },

  getRandomPoem: async () => {
    const response = await axios.get(`${API}/random-poem`);
    return response.data.poem || response.data;
  },

  getMostViewed: async (limit = 5) => {
    const response = await axios.get(`${API}/poems/most-viewed?limit=${limit}`);
    return response.data.poems || response.data;
  },

  recordView: async (poemId) => {
    try {
      await axios.post(`${API}/poems/${poemId}/view`);
    } catch {
      // fire and forget
    }
  },
};

export const taxonomyApi = {
  getCategories: async () => {
    const response = await axios.get(`${API}/categories`);
    return response.data.categories || response.data;
  },

  getTags: async () => {
    const response = await axios.get(`${API}/tags`);
    return response.data.tags || response.data;
  },
};

export const newsletterApi = {
  subscribe: async (email) => {
    const response = await axios.post(`${API}/newsletter/subscribe`, { email });
    return response.data;
  },
};

export const sendContactMessage = async ({ name, email, subject, message }) => {
  const response = await axios.post(`${API}/contact`, { name, email, subject, message });
  return response.data;
};

// ── Admin APIs ───────────────────────────────────────────────────

export const adminApi = {
  login: async (password) => {
    const response = await adminAxios.post('/admin/login', { password });
    // Store token as fallback for Bearer header; httpOnly cookie is primary auth
    if (response.data.token) {
      sessionStorage.setItem('adminToken', response.data.token);
      sessionStorage.setItem('adminAuth', 'true');
    }
    return response.data;
  },

  logout: async () => {
    try {
      await adminAxios.post('/admin/logout');
    } catch {
      // ignore
    }
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminAuth');
  },

  getStats: async () => {
    const response = await adminAxios.get('/admin/stats');
    return response.data;
  },

  getPoems: async () => {
    const response = await adminAxios.get('/admin/poems');
    return response.data;
  },

  getPoem: async (id) => {
    const response = await adminAxios.get(`/admin/poems/${id}`);
    return response.data;
  },

  createPoem: async (poemData) => {
    const response = await adminAxios.post('/admin/poems', poemData);
    return response.data;
  },

  updatePoem: async (id, poemData) => {
    const response = await adminAxios.put(`/admin/poems/${id}`, poemData);
    return response.data;
  },

  deletePoem: async (id) => {
    const response = await adminAxios.delete(`/admin/poems/${id}`);
    return response.data;
  },

  getComments: async () => {
    const response = await adminAxios.get('/admin/comments');
    return response.data;
  },

  moderateComment: async (commentId, approved) => {
    const response = await adminAxios.put(`/admin/comments/${commentId}`, { approved });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await adminAxios.delete(`/admin/comments/${commentId}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await adminAxios.get('/admin/analytics');
    return response.data;
  },

  getNotifications: async () => {
    const response = await adminAxios.get('/admin/notifications');
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await adminAxios.put(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await adminAxios.put('/admin/notifications/read-all');
    return response.data;
  },

  getSubscribers: async () => {
    const response = await adminAxios.get('/admin/subscribers');
    return response.data;
  },

  sendBulkEmail: async (subject, content) => {
    const response = await adminAxios.post('/admin/send-bulk-email', { subject, content });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await adminAxios.post('/admin/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  getSiteAnalytics: async (days = 30) => {
    const response = await adminAxios.get(`/admin/site-analytics?days=${days}`);
    return response.data;
  },

  getGeoAnalytics: async () => {
    const response = await adminAxios.get('/admin/site-analytics/geo');
    return response.data;
  },

  getExportUrl: (type, format) => {
    const token = sessionStorage.getItem('adminToken');
    return `${API}/admin/export/${type}/${format}?token=${encodeURIComponent(token || '')}`;
  },

  exportSubscribersCSV: () => {
    const token = sessionStorage.getItem('adminToken');
    return `${API}/admin/export/subscribers/csv?token=${encodeURIComponent(token || '')}`;
  },
};

export default { poemsApi, taxonomyApi, newsletterApi, adminApi };
