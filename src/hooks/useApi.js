import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Main API hook that provides core functionality
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleRequest = useCallback(async (method, endpoint, data = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('No active session');
      }
      
      // Make direct Supabase requests instead of using a separate API
      let result;
      
      switch (method) {
        case 'GET':
          // Extract table and filters from endpoint
          const table = endpoint.split('/')[1];
          result = await supabase.from(table).select('*');
          break;
          
        case 'POST':
          // Extract table from endpoint
          const postTable = endpoint.split('/')[1];
          result = await supabase.from(postTable).insert(data).select();
          break;
          
        case 'PUT':
          // Extract table and id from endpoint
          const [putTable, id] = endpoint.split('/').slice(1);
          result = await supabase.from(putTable).update(data).eq('id', id).select();
          break;
          
        case 'DELETE':
          // Extract table and id from endpoint
          const [deleteTable, deleteId] = endpoint.split('/').slice(1);
          result = await supabase.from(deleteTable).delete().eq('id', deleteId);
          break;
          
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      if (result.error) throw result.error;
      
      return { data: result.data, status: 200 };
    } catch (err) {
      console.error(`API ${method} Error:`, err);
      setError(err.message || 'An unexpected error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Define convenience methods
  const get = useCallback((endpoint) => handleRequest('GET', endpoint), [handleRequest]);
  const post = useCallback((endpoint, data) => handleRequest('POST', endpoint, data), [handleRequest]);
  const put = useCallback((endpoint, data) => handleRequest('PUT', endpoint, data), [handleRequest]);
  const del = useCallback((endpoint) => handleRequest('DELETE', endpoint), [handleRequest]);
  
  return {
    get,
    post,
    put,
    delete: del,
    isLoading,
    error,
  };
};

// Custom hooks that wrap the useApi hook for specific HTTP methods
export const useGet = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  
  const fetchData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle parameters by appending to endpoint or filtering results
      const finalEndpoint = params 
        ? `${endpoint}${Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : ''}`
        : endpoint;
      
      const response = await api.get(finalEndpoint);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, endpoint]);
  
  return { data, loading, error, fetchData };
};

export const usePost = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  
  const postData = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(endpoint, payload);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to post data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, endpoint]);
  
  return { data, loading, error, postData };
};

export const usePut = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  
  const putData = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(endpoint, payload);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, endpoint]);
  
  return { data, loading, error, putData };
};

export const useDelete = (endpoint) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  
  const deleteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(endpoint);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to delete data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, endpoint]);
  
  return { loading, error, deleteData };
};
