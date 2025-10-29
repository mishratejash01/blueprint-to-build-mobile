import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { playOrderSound } from "@/utils/notifications";

const PartnerOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time order changes
    const channel = supabase
      .channel("partner-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        (payload) => {
          console.log("Order changed:", payload);
          if (payload.eventType === "INSERT" && payload.new.status === "ready_for_pickup") {
            playOrderSound();
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log("Fetching orders for user:", user.id);

    // Get available orders - remove the stores join temporarily
    const { data: available, error: availableError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "ready_for_pickup")
      .is("delivery_partner_id", null)
      .order("created_at", { ascending: false });

    console.log("Available orders query result:", { available, availableError });
    
    // If we got orders, fetch store details separately
    if (available && available.length > 0) {
      const storeIds = [...new Set(available.map(o => o.store_id))];
      const { data: stores } = await supabase
        .from("stores")
        .select("*")
        .in("id", storeIds);
      
      console.log("Stores data:", stores);
      
      // Merge store data into orders
      const ordersWithStores = available.map(order => ({
        ...order,
        stores: stores?.find(s => s.id === order.store_id)
      }));
      
      setAvailableOrders(ordersWithStores);
    } else {
      setAvailableOrders([]);
    }

    // Get active order
    const { data: active, error: activeError } = await supabase
      .from("orders")
      .select("*")
      .eq("delivery_partner_id", user.id)
      .eq("status", "in_transit")
      .maybeSingle();

    console.log("Active order query result:", { active, activeError });
    
    if (active) {
      // Fetch store and order items separately
      const { data: store } = await supabase
        .from("stores")
        .select("*")
        .eq("id", active.store_id)
        .single();
      
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", active.id);
      
      setActiveOrder({
        ...active,
        stores: store,
        order_items: items || []
      });
    } else {
      setActiveOrder(null);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    console.log("Attempting to accept order:", orderId);
    console.log("Order ID type:", typeof orderId);
    
    try {
      const { data, error } = await supabase.rpc('accept_order', {
        order_id_to_accept: orderId
      });

      console.log("Accept order response:", { data, error });

      if (error) {
        console.error("Accept order error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        toast({
          title: "Order unavailable",
          description: error.message || "Sorry, this order was just taken by another partner",
          variant: "destructive"
        });
        // Refresh the orders list
        fetchOrders();
      } else {
        console.log("Order accepted successfully:", data);
        
        // Sync updated order status to Google Sheets
        supabase.functions.invoke('sync-orders-to-sheet', {
          body: { order_id: orderId }
        }).catch(err => console.error('Failed to sync to sheets:', err));
        
        toast({
          title: "Order accepted!",
          description: "Starting delivery"
        });
        navigate(`/partner/delivery/${orderId}`);
      }
    } catch (err) {
      console.error("Caught exception:", err);
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive"
      });
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
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Pickup:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.stores?.address || "Store address"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-accent" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Delivery:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address}
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Earnings:</span>
                      <span className="text-lg font-bold text-primary">₹50</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">Distance:</span>
                      <span className="text-sm font-semibold">~3 km</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="w-full"
                  >
                    Accept Order
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const address = encodeURIComponent(order.stores?.address || "");
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    View Route
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PartnerOrders;
