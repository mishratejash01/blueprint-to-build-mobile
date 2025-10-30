import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, TrendingUp, Package, Star } from "lucide-react";
import { format, startOfWeek, startOfMonth, isWithinInterval } from "date-fns";

interface EarningsData {
  today: number;
  week: number;
  month: number;
  totalDeliveries: number;
  rating: number;
  completionRate: number;
}

const PartnerEarnings = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<EarningsData>({
    today: 0,
    week: 0,
    month: 0,
    totalDeliveries: 0,
    rating: 4.8,
    completionRate: 95,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orders } = await (supabase as any)
        .from("orders")
        .select("delivery_fee, created_at, status")
        .eq("delivery_partner_id", user.id)
        .eq("status", "delivered");

      if (!orders) return;

      const now = new Date();
      const weekStart = startOfWeek(now);
      const monthStart = startOfMonth(now);

      let todayEarnings = 0;
      let weekEarnings = 0;
      let monthEarnings = 0;

      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const fee = Number(order.delivery_fee) || 0;

        if (format(orderDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
          todayEarnings += fee;
        }

        if (isWithinInterval(orderDate, { start: weekStart, end: now })) {
          weekEarnings += fee;
        }

        if (isWithinInterval(orderDate, { start: monthStart, end: now })) {
          monthEarnings += fee;
        }
      });

      setEarnings({
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        totalDeliveries: orders.length,
        rating: 4.8,
        completionRate: 95,
      });
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["partner"]}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-10 bg-card border-b p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/partner/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Earnings</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4 mt-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">Today's Earnings</span>
                  </div>
                  <div className="text-4xl font-bold">₹{earnings.today.toFixed(2)}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="space-y-4 mt-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">This Week's Earnings</span>
                  </div>
                  <div className="text-4xl font-bold">₹{earnings.week.toFixed(2)}</div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="space-y-4 mt-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">This Month's Earnings</span>
                  </div>
                  <div className="text-4xl font-bold">₹{earnings.month.toFixed(2)}</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Total Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Your Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings.rating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-bold">{earnings.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average per Delivery</span>
                <span className="text-sm font-bold">
                  ₹{earnings.totalDeliveries > 0 ? (earnings.month / earnings.totalDeliveries).toFixed(2) : "0.00"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PartnerEarnings;
