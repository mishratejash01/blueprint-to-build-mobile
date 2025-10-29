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

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get partner availability from profile
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("partner_data")
      .eq("id", user.id)
      .single();

    const partnerData = (profile as any)?.partner_data || {};
    setIsAvailable(partnerData.is_available || false);

    // Get available orders count
    const { count: availableCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "ready_for_pickup")
      .is("delivery_partner_id", null);

    // Get completed deliveries count
    const { count: completedCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("delivery_partner_id", user.id)
      .eq("status", "delivered");

    setStats({
      available: availableCount || 0,
      completed: completedCount || 0
    });
  };

  const handleToggleAvailability = async (checked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get existing partner_data
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("partner_data")
      .eq("id", user.id)
      .single();

    const existingPartnerData = (profile as any)?.partner_data || {};

    const { error } = await (supabase as any)
      .from("profiles")
      .update({
        partner_data: {
          ...existingPartnerData,
          is_available: checked,
        }
      } as any)
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setIsAvailable(checked);
      toast({
        title: checked ? "You're now online" : "You're now offline",
        description: checked ? "You'll receive delivery requests" : "You won't receive new requests"
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth?type=partner");
  };

  return (
    <ProtectedRoute>
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
                  {isAvailable ? "You're online" : "You're offline"}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
              />
            </div>
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
