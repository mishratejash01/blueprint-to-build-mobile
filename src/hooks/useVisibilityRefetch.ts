import { useEffect } from 'react';

/**
 * Automatically refetch data when browser tab becomes visible
 * Prevents stale data when users return to the app
 */
export const useVisibilityRefetch = (refetchFn: () => void) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, refetching data...');
        refetchFn();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchFn]);
};
