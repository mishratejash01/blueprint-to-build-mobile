import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  popularProducts: { name: string; count: number }[];
}

const StoreAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    popularProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get store
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("manager_id", user.id)
        .single();

      if (!store) return;

      // Get orders for this store
      const { data: orders } = await supabase
        .from("orders")
        .select("total, status")
        .eq("store_id", store.id);

      // Get products count
      const { data: products, count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("store_id", store.id);

      // Calculate revenue (only delivered orders)
      const deliveredOrders = orders?.filter(o => o.status === "delivered") || [];
      const revenue = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);

      // Get popular products (mock data for now)
      const popular = products?.slice(0, 5).map(p => ({
        name: p.name,
        count: Math.floor(Math.random() * 50) + 10,
      })) || [];

      setAnalytics({
        totalRevenue: revenue,
        totalOrders: orders?.length || 0,
        totalProducts: productCount || 0,
        popularProducts: popular,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/store/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">Total orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                <p className="text-xs text-muted-foreground">In inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Avg Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{analytics.totalOrders > 0 ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) : 0}
                </div>
                <p className="text-xs text-muted-foreground">Per order</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular Products</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.popularProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.popularProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-sm text-muted-foreground">{product.count} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreAnalytics;
