import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to order updates
    const channel = supabase
      .channel("order-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`
        },
        (payload) => setOrder(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "We've received your order!";
      case "processing":
        return "Your store is packing your items!";
      case "ready_for_pickup":
        return "Order is ready for pickup";
      case "in_transit":
        return "Your order is on the way!";
      case "delivered":
        return "Ding dong! Your groceries are at the door. Enjoy!";
      default:
        return "Processing your order";
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const statuses = [
      { key: "pending", label: "Order Placed", icon: Clock },
      { key: "processing", label: "Preparing", icon: Package },
      { key: "in_transit", label: "On the Way", icon: Truck },
      { key: "delivered", label: "Delivered", icon: CheckCircle2 }
    ];

    const statusIndex = statuses.findIndex(s => s.key === currentStatus);

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= statusIndex,
      active: index === statusIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const steps = order ? getStatusSteps(order.status) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Track Order</h1>
            <p className="text-sm text-muted-foreground">
              #{order?.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {order && (
          <Card className="p-6 text-center gradient-primary text-white">
            <h2 className="text-2xl font-bold mb-2">
              {getStatusMessage(order.status)}
            </h2>
            <p className="text-white/90">Estimated delivery: 25-30 minutes</p>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-bold mb-4">Order Status</h3>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-2 ${
                          step.completed ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <h4
                      className={`font-semibold ${
                        step.active ? "text-primary" : ""
                      }`}
                    >
                      {step.label}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {order && (
          <Card className="p-4">
            <h3 className="font-bold mb-3">Delivery Address</h3>
            <p className="text-muted-foreground">{order.delivery_address}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
