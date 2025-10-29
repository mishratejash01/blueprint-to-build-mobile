import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Please enter delivery address",
        variant: "destructive"
      });
      return;
    }

    if (!session?.user) {
      toast({
        title: "Error",
        description: "Please login to place order",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Get the first active store for MVP
      const { data: stores } = await supabase
        .from("stores")
        .select("id")
        .eq("is_active", true)
        .limit(1);

      if (!stores || stores.length === 0) {
        throw new Error("No active stores available");
      }

      const deliveryFee = 20;
      const totalAmount = total + deliveryFee;

      // Create order - automatically set to ready_for_pickup via database trigger
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: session.user.id,
          store_id: stores[0].id,
          delivery_address: address,
          subtotal: total,
          delivery_fee: deliveryFee,
          total: totalAmount,
          payment_status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Sync order to Google Sheets (fire and forget - don't block user flow)
      supabase.functions.invoke('sync-orders-to-sheet', {
        body: {
          order_id: order.id,
          google_sheets_webhook_url: 'https://script.google.com/macros/s/AKfycbwn0KMmiZ9eusYsH4Bm-N1Z_I_jyJ_XuOxJsDDfqKT_Bb4fAvN67CxmoufJWZpiyL6VtQ/exec'
        }
      }).catch(err => {
        console.error('Failed to sync order to Google Sheets:', err);
        // Don't throw - we don't want to block the order flow
      });

      clearCart();
      navigate(`/order-confirmation/${order.id}`);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h2 className="font-bold text-lg mb-4">Delivery Address</h2>
          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <h2 className="font-bold text-lg mb-4">Payment Method</h2>
          <p className="text-muted-foreground">Cash on Delivery</p>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{(total + 20).toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full btn-touch"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
