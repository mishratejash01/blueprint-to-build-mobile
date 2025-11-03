import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Clock } from "lucide-react";
import { format } from "date-fns";
import { getOrderStatusMessage, getStatusEmoji } from "@/utils/notifications";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_address: string;
  store_id: string;
}

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    // Navigate to store/home to allow reordering
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="sticky top-0 z-10 bg-card border-b p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Order History</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No orders yet. Start shopping to see your order history!
              </p>
              <Button className="mt-4" onClick={() => navigate("/home")}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getStatusEmoji(order.status)} Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(order.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{getOrderStatusMessage(order.status)}</p>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.delivery_address}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                        Reorder
                      </Button>
                    )}
                    <Button size="sm" onClick={() => navigate(`/track/${order.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
