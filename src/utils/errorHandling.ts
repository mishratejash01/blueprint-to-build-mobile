import { toast } from "@/hooks/use-toast";

/**
 * Standardized error handling for Supabase queries
 * Logs error to console and shows user-friendly toast message
 */
export const handleSupabaseError = (error: any, action: string) => {
  console.error(`Error ${action}:`, error);
  
  // Extract user-friendly message
  const message = error?.message || `Failed to ${action}`;
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (error: any) => {
  console.error('Auth error:', error);
  
  const message = error?.message || "Authentication failed";
  
  toast({
    title: "Authentication Error",
    description: message,
    variant: "destructive",
  });
};

/**
 * Generic error handler with custom message
 */
export const handleError = (error: any, customMessage?: string) => {
  console.error('Error:', error);
  
  toast({
    title: "Error",
    description: customMessage || error?.message || "Something went wrong",
    variant: "destructive",
  });
};
