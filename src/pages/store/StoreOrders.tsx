import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const StoreOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();

    // Subscribe to order changes
    const channel = supabase
      .channel("store-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("manager_id", user.id)
      .single();

    if (store) {
      // Get orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      setOrders(ordersData || []);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready_for_pickup" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Order marked as ready for pickup"
      });
      fetchOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      processing: "default",
      ready_for_pickup: "default",
      in_transit: "default",
      delivered: "default"
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Orders</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No orders yet</p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{order.total}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold">Items:</p>
                  {order.order_items.map((item: any) => (
                    <p key={item.id} className="text-sm text-muted-foreground">
                      {item.product_name} x {item.quantity}
                    </p>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1">Delivery Address:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.delivery_address}
                  </p>
                </div>

                {order.status === "pending" && (
                  <Button
                    onClick={() => handleMarkReady(order.id)}
                    className="w-full"
                  >
                    Mark as Ready for Pickup
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreOrders;
