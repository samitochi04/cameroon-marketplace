import axios from 'axios';

// Create an Axios instance with default config
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/${import.meta.env.VITE_API_VERSION || 'v1'}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/${import.meta.env.VITE_API_VERSION || 'v1'}/auth/refresh-token`, {
          refreshToken,
        });
        
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is invalid or expired, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
