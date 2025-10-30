import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const ActiveDelivery = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, stores(*), order_items(*)")
      .eq("id", orderId)
      .single();

    setOrder(data);
  };

  const handleMarkDelivered = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Sync updated order status to Google Sheets
      supabase.functions.invoke('sync-orders-to-sheet', {
        body: { order_id: orderId }
      }).catch(err => console.error('Failed to sync to sheets:', err));
      
      toast({
        title: "Order delivered!",
        description: "Great job! You can now accept more orders."
      });
      navigate("/partner/dashboard");
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-primary text-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <p className="font-semibold">Active Delivery</p>
          </div>
          <p className="text-2xl font-bold">₹{order.total}</p>
          <p className="text-sm opacity-90">Order #{order.id.slice(0, 8)}</p>
        </div>

        <div className="p-4 space-y-4">
          <Card className="p-4 bg-accent/5">
            <h3 className="font-semibold mb-3">Customer Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-semibold">{order.customer_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone:</span>
                <a 
                  href={`tel:${order.customer_phone}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {order.customer_phone || "N/A"}
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Pickup Location</p>
                <p className="text-sm text-muted-foreground">
                  {order.stores?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.stores?.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Delivery Location</p>
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm"
                >
                  <span>{item.product_name} x {item.quantity}</span>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <Button
            onClick={handleMarkDelivered}
            className="w-full btn-touch"
          >
            <CheckCircle2 className="mr-2" />
            Mark as Delivered
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ActiveDelivery;
