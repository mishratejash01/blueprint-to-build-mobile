import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Truck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [stats, setStats] = useState({ available: 0, completed: 0 });
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    try {
      setIsLoadingData(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get partner availability from new dedicated column (optimized)
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_available")
        .eq("id", user.id)
        .single();

      setIsAvailable(profile?.is_available || false);

      // Get available orders count
      const { count: availableCount } = await (supabase as any)
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "ready_for_pickup")
        .is("delivery_partner_id", null);

      // Get completed deliveries count
      const { count: completedCount } = await (supabase as any)
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("delivery_partner_id", user.id)
        .eq("status", "delivered");

      setStats({
        available: availableCount || 0,
        completed: completedCount || 0
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    if (isTogglingAvailability) return; // Prevent double-clicks
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ No user found");
      toast({
        title: "Error",
        description: "You must be logged in to change availability",
        variant: "destructive"
      });
      return;
    }

    setIsTogglingAvailability(true);
    console.log("🔄 Toggling availability to:", checked);
    
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Update UI immediately for instant feedback
    setIsAvailable(checked);

    const { error } = await supabase
      .from("profiles")
      .update({ is_available: checked })
      .eq("id", user.id);

    if (error) {
      console.error("❌ Toggle failed:", error);
      // Revert UI on error
      setIsAvailable(!checked);
      toast({
        title: "❌ Failed to update",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log("✅ Toggle successful");
      
      // Refetch data to sync stats
      await fetchPartnerData();
      
      toast({
        title: checked ? "🟢 You're now online!" : "⚫ You're now offline",
        description: checked ? "You'll receive delivery requests" : "You won't receive new requests"
      });
    }
    
    setIsTogglingAvailability(false);
  };

  const handleLogout = async () => {
    try {
      // 1. Close all Supabase channels FIRST
      await supabase.removeAllChannels();
      
      // 2. Clear all local caches
      sessionStorage.clear();
      
      // 3. Clear specific localStorage items (keep auth tokens for proper signout)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // 4. Sign out from Supabase (this clears auth tokens)
      await supabase.auth.signOut();
      
      // 5. Force navigation with replace
      navigate("/auth?type=partner", { replace: true });
      
      // 6. Force reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/auth?type=partner";
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Force reload anyway
      window.location.href = "/auth?type=partner";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Partner Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Availability</h3>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "🟢 You're online" : "⚫ You're offline"}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                disabled={isTogglingAvailability || isLoadingData}
              />
            </div>
            {isTogglingAvailability && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                Updating...
              </p>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.available}</p>
              <p className="text-sm text-muted-foreground">Available Orders</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <Button
              onClick={() => navigate("/partner/orders")}
              className="w-full justify-start"
              variant="outline"
            >
              <Truck className="mr-2" />
              View Available Orders
            </Button>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PartnerDashboard;
