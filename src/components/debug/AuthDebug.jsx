import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        className="bg-gray-800 text-white text-xs px-2 py-1 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        Debug Auth
      </button>
      
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-md p-3 mt-1 shadow-lg max-w-md overflow-auto max-h-96">
          <div className="text-sm font-medium mb-2">Auth Debug Info</div>
          <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
            {JSON.stringify({
              isAuthenticated,
              userId: user?.id,
              email: user?.email,
              role: user?.role,
              metadata: user?.user_metadata
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
