import { useSupabaseRefresh } from '@/lib/supabase';
import { useCallback } from 'react';

/**
 * Hook for components to force refresh data when needed
 * @returns {Object} with refreshData function
 */
export const useForceRefresh = () => {
  const { refreshData } = useSupabaseRefresh();
  
  const refresh = useCallback(() => {
    // Trigger the global refresh
    refreshData();
    
    // Return a promise that resolves after a short delay
    // This ensures any useEffect hooks have time to trigger
    return new Promise(resolve => setTimeout(resolve, 50));
  }, [refreshData]);
  
  return { refresh };
};

export default useForceRefresh;
