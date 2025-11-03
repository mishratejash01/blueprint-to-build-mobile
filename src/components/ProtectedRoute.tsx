import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type UserRole = "customer" | "partner" | "store_manager";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session and role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session && allowedRoles) {
        // Fetch user role from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        setUserRole(profile?.role as UserRole || null);
      }
      
      setRoleChecked(true);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session && allowedRoles) {
        // Fetch user role from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        setUserRole(profile?.role as UserRole || null);
      }
      
      setRoleChecked(true);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [allowedRoles]);

  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has required role
  if (allowedRoles && session && userRole) {
    if (!allowedRoles.includes(userRole)) {
      // Show error toast
      toast({
        title: "Access Denied",
        description: `This page is only accessible to ${allowedRoles.join(" or ")} users.`,
        variant: "destructive"
      });
      
      // Redirect to correct dashboard based on actual role
      if (userRole === "store_manager") {
        return <Navigate to="/store/dashboard" replace />;
      } else if (userRole === "partner") {
        return <Navigate to="/partner/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
