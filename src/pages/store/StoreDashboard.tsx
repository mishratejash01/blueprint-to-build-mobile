import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Package, ShoppingCart, TrendingUp, Clock, DollarSign, LogOut, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

const StoreDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    todaySales: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreInfo();
  }, []);

  useEffect(() => {
    if (storeInfo?.id) {
      fetchStats();
      
      // Subscribe to real-time order updates for this specific store
      const channel = supabase
        .channel('store-orders')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeInfo.id}`
        }, () => {
          console.log('Order update received for store:', storeInfo.id);
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [storeInfo?.id]);

  const fetchStoreInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to access the store dashboard');
        setLoading(false);
        return;
      }

      console.log('Fetching store info for user:', user.id);

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .or(`manager_id.eq.${user.id},authorized_users.cs.{${user.id}}`)
        .maybeSingle();

      if (error) {
        console.error('Error fetching store info:', error);
        setError('Failed to load store information');
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('No store found for user:', user.id);
        setError('You are not authorized to access any store. Please contact the administrator.');
        setLoading(false);
        return;
      }

      console.log('Store loaded successfully:', data.name);
      setStoreInfo(data);
      setError(null);
    } catch (error: any) {
      console.error('Unexpected error in fetchStoreInfo:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    if (!storeInfo) return;

    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_available: checked })
        .eq('id', storeInfo.id);

      if (error) throw error;

      setStoreInfo({ ...storeInfo, is_available: checked });
      toast.success(
        checked ? '✅ Store is now OPEN for orders' : '❌ Store is now CLOSED',
        { duration: 3000 }
      );
    } catch (error: any) {
      toast.error('Failed to update store availability');
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from('stores')
        .select('id, total_sales')
        .or(`manager_id.eq.${user.id},authorized_users.cs.{${user.id}}`)
        .single();

      if (!store) return;

      // Get pending orders count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .in('status', ['pending', 'ready_for_pickup']);

      const { count: activeCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('status', 'in_transit');

      // Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      // Get today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySalesData } = await supabase
        .from('orders')
        .select('total')
        .eq('store_id', store.id)
        .eq('status', 'delivered')
        .gte('created_at', today)
        .select('total');

      const todayTotal = todaySalesData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Get total products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      setStats({
        totalOrders: orderCount || 0,
        pendingOrders: pendingCount || 0,
        activeDeliveries: activeCount || 0,
        todaySales: todayTotal,
        totalRevenue: store.total_sales || 0,
        totalProducts: productCount || 0,
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth?type=store");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Access Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchStoreInfo();
              }} 
              className="w-full"
            >
              Retry
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              {/* Left: Store Icon & ID */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {storeInfo?.id?.slice(0, 8)}
                </span>
              </div>
              
              {/* Center: Store Name (PROMINENT) */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {storeInfo?.name || 'Store Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {storeInfo?.address}
                </p>
              </div>
              
              {/* Right: Toggle & Logout */}
              <div className="flex items-center justify-end gap-3">
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  storeInfo?.is_available 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted border-border'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl transition-all ${
                      storeInfo?.is_available ? 'animate-pulse scale-110' : 'grayscale'
                    }`}>
                      {storeInfo?.is_available ? '✅' : '❌'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium">
                        Store Status
                      </span>
                      <span className={`text-base font-bold transition-colors ${
                        storeInfo?.is_available 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`}>
                        {storeInfo?.is_available ? 'OPEN' : 'CLOSED'}
                      </span>
                    </div>
                  </div>
                  <Switch
                    id="store-availability"
                    checked={storeInfo?.is_available}
                    onCheckedChange={handleToggleAvailability}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Needs preparation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats.activeDeliveries}</div>
                <p className="text-xs text-muted-foreground mt-1">Out for delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{stats.todaySales.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Revenue today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">All-time sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Available items</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate("/store/orders")}
                  className="w-full justify-start"
                  variant="outline"
                  size="lg"
                >
                  <ShoppingCart className="mr-2" />
                  Manage Orders
                </Button>
                <Button
                  onClick={() => navigate("/store/inventory")}
                  className="w-full justify-start"
                  variant="outline"
                  size="lg"
                >
                  <Package className="mr-2" />
                  Manage Inventory
                </Button>
                <Button
                  onClick={() => navigate("/store/analytics")}
                  className="w-full justify-start"
                  variant="outline"
                  size="lg"
                >
                  <TrendingUp className="mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreDashboard;