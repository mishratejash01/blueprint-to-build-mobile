import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, ShoppingBag, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ orders: 0, products: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get store
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("manager_id", user.id)
        .single();

      if (store) {
        // Get order count
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("store_id", store.id)
          .eq("status", "pending");

        // Get product count
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("store_id", store.id);

        setStats({
          orders: orderCount || 0,
          products: productCount || 0
        });
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth?type=store");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Store Dashboard</h1>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.orders}</p>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats.products}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/store/orders")}
                className="w-full justify-start"
                variant="outline"
              >
                <ShoppingBag className="mr-2" />
                Manage Orders
              </Button>
              <Button
                onClick={() => navigate("/store/inventory")}
                className="w-full justify-start"
                variant="outline"
              >
                <Package className="mr-2" />
                Manage Inventory
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreDashboard;
