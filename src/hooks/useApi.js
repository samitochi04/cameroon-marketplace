import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Hook for common API functionality
export const useApi = () => {
  const { getToken, logout } = useAuth();
  
  // Create an axios instance with base configuration
  const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/${import.meta.env.VITE_API_VERSION || 'v1'}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add auth token to requests
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Handle response errors
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If 401 error (unauthorized) and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const newToken = await refreshToken();
          
          if (newToken) {
            // Update the request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // If refresh token fails, logout user
          console.error('Error refreshing token:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // Generic request method with error handling
  const request = useCallback(async (method, endpoint, data = null, options = {}) => {
    try {
      const response = await apiClient({
        method,
        url: endpoint,
        data: method !== 'get' ? data : undefined,
        params: method === 'get' ? data : undefined,
        ...options,
      });
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        // You might want to trigger a logout or token refresh here
      }
      
      throw {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      };
    }
  }, [getToken, apiClient]);

  // Hook exports for different HTTP methods
  const useGet = (endpoint, initialData = null) => {
    const [data, setData] = useState(initialData);
    
    const fetchData = useCallback(async (params = {}) => {
      try {
        const response = await request('get', endpoint, params);
        setData(response.data);
        return response;
      } catch (error) {
        // Let the error propagate to the caller
        throw error;
      }
    }, [endpoint, request]);

    return {
      data,
      fetchData,
    };
  };

  const usePost = () => {
    const post = useCallback(async (endpoint, data = {}, options = {}) => {
      return await request('post', endpoint, data, options);
    }, [request]);

    return {
      post,
    };
  };

  const usePut = () => {
    const put = useCallback(async (endpoint, data = {}, options = {}) => {
      return await request('put', endpoint, data, options);
    }, [request]);

    return {
      put,
    };
  };

  const useDelete = () => {
    const del = useCallback(async (endpoint, options = {}) => {
      return await request('delete', endpoint, null, options);
    }, [request]);

    return {
      delete: del,
    };
  };

  // Convenience methods for API calls
  const get = useCallback((url, config = {}) => {
    return apiClient.get(url, config);
  }, [apiClient]);
  
  const post = useCallback((url, data = {}, config = {}) => {
    return apiClient.post(url, data, config);
  }, [apiClient]);
  
  const put = useCallback((url, data = {}, config = {}) => {
    return apiClient.put(url, data, config);
  }, [apiClient]);
  
  const patch = useCallback((url, data = {}, config = {}) => {
    return apiClient.patch(url, data, config);
  }, [apiClient]);
  
  const del = useCallback((url, config = {}) => {
    return apiClient.delete(url, config);
  }, [apiClient]);
  
  // Helper function for token refresh
  const refreshToken = async () => {
    try {
      // Implementation depends on your auth provider
      // This is a placeholder for actual token refresh logic
      return await getToken(true);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  };
  
  return {
    request,
    get,
    post,
    put,
    patch,
    del
  };
};

// Convenience exports for individual HTTP method hooks
export const useGet = (endpoint, initialData = null) => {
  const api = useApi();
  return api.useGet(endpoint, initialData);
};

export const usePost = () => {
  const api = useApi();
  return api.usePost();
};

export const usePut = () => {
  const api = useApi();
  return api.usePut();
};

export const useDelete = () => {
  const api = useApi();
  return api.useDelete();
};
