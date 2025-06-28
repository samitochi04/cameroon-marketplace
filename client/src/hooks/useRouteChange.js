import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that detects route changes in React Router
 * Returns the current location and a boolean indicating if the route has changed
 */
export const useRouteChange = () => {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);
  const [hasRouteChanged, setHasRouteChanged] = useState(false);
  
  useEffect(() => {
    // When location changes, update state
    if (previousPath !== location.pathname) {
      setHasRouteChanged(true);
      setPreviousPath(location.pathname);
    } else {
      setHasRouteChanged(false);
    }
  }, [location, previousPath]);
  
  return { 
    location, 
    hasRouteChanged,
    pathname: location.pathname
  };
};

export default useRouteChange;
