import { supabase } from "@/integrations/supabase/client";

/**
 * Clears all local caches and forces fresh data fetch
 * Preserves authentication tokens
 */
export const clearAllCaches = () => {
  // Clear localStorage (except auth tokens)
  const authKeys = ['sb-access-token', 'sb-refresh-token'];
  const authData: Record<string, string> = {};
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) authData[key] = value;
  });
  
  localStorage.clear();
  
  // Restore auth tokens
  Object.entries(authData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Close all Supabase channels and reconnect
  supabase.removeAllChannels();
  
  console.log('✅ All caches cleared');
};

/**
 * Force refresh all order-related data
 */
export const refreshOrderData = async () => {
  // Dispatch custom event that components can listen to
  window.dispatchEvent(new CustomEvent('force-refresh-orders'));
};
