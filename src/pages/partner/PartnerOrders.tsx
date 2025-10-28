import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const PartnerOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();

    // Subscribe to order changes
    const channel = supabase
      .channel("partner-orders")
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

    // Get available orders
    const { data: available } = await supabase
      .from("orders")
      .select("*, stores(*)")
      .eq("status", "ready_for_pickup")
      .is("delivery_partner_id", null)
      .order("created_at", { ascending: false });

    setAvailableOrders(available || []);

    // Get active order
    const { data: active } = await supabase
      .from("orders")
      .select("*, stores(*), order_items(*)")
      .eq("delivery_partner_id", user.id)
      .eq("status", "in_transit")
      .single();

    setActiveOrder(active);
  };

  const handleAcceptOrder = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_partner_id: user.id,
        status: "in_transit"
      })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Order accepted!",
        description: "Starting delivery"
      });
      navigate(`/partner/delivery/${orderId}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Available Orders</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {activeOrder && (
            <Card className="p-4 border-primary">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="font-semibold text-primary">Active Delivery</p>
              </div>
              <Button
                onClick={() => navigate(`/partner/delivery/${activeOrder.id}`)}
                className="w-full"
              >
                Continue to Delivery
              </Button>
            </Card>
          )}

          {availableOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No available orders</p>
            </Card>
          ) : (
            availableOrders.map((order) => (
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
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">Pickup:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.stores?.address || "Store address"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Delivery:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="w-full"
                >
                  Accept Order
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PartnerOrders;
