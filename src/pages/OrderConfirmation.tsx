import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      setOrder(data);
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been confirmed
        </p>

        {order && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold">₹{order.total}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/track/${orderId}`)}
            className="w-full"
          >
            Track Order
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/home")}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderConfirmation;
