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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set timeout to prevent infinite loading (3 seconds)
    const timer = setTimeout(() => {
      if (mounted && loading) {
        setLoadingTimeout(true);
        setLoading(false);
        setRoleChecked(true);
      }
    }, 3000);

    // Cache key for role to reduce DB queries
    const getCachedRole = () => {
      try {
        return sessionStorage.getItem('userRole') as UserRole | null;
      } catch {
        return null;
      }
    };

    const setCachedRole = (role: UserRole) => {
      try {
        sessionStorage.setItem('userRole', role);
      } catch (err) {
        console.error('Failed to cache role:', err);
      }
    };

    // Get initial session and role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      
      if (session && allowedRoles) {
        // Try to get cached role first
        const cachedRole = getCachedRole();
        if (cachedRole) {
          setUserRole(cachedRole);
          setRoleChecked(true);
          setLoading(false);
          return;
        }

        // Fetch user role from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (!mounted) return;
        
        const role = profile?.role as UserRole || null;
        setUserRole(role);
        if (role) setCachedRole(role);
      }
      
      setRoleChecked(true);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      
      if (session && allowedRoles) {
        // Fetch user role from database
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (!mounted) return;
        
        const role = profile?.role as UserRole || null;
        setUserRole(role);
        if (role) setCachedRole(role);
      } else {
        // Clear cached role on logout
        sessionStorage.removeItem('userRole');
      }
      
      setRoleChecked(true);
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [allowedRoles]);

  // If timeout reached, redirect immediately (don't block)
  if (loadingTimeout && !session && requireAuth) {
    window.location.href = "/auth";
    return null;
  }

  // CRITICAL FIX: Show content optimistically with non-blocking overlay
  if (loading || !roleChecked) {
    return (
      <div className="relative min-h-screen">
        {children}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-card p-6 rounded-xl shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Verifying access...</p>
          </div>
        </div>
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
