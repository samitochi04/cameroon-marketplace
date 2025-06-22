import axios from 'axios';

// Get the API base URL from environment variables or use a default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create an axios instance with default configs
const ApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for authentication
ApiClient.interceptors.request.use(
  async (config) => {
    // You could add logic here to get the token from localStorage or elsewhere
    // and add it to the Authorization header for authenticated requests
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling errors consistently
ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error statuses
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Dispatch logout action or redirect to login
        console.log('Unauthorized. Redirecting to login...');
        // You could trigger a logout/redirect here
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export { ApiClient };
