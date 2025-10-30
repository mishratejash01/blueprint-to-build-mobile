import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  is_default: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "online">("cash_on_delivery");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadSavedAddresses(session.user.id);
      }
    });
  }, [navigate]);

  const loadSavedAddresses = async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });

    if (!error && data) {
      setSavedAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setName(defaultAddr.name);
        setPhone(defaultAddr.phone);
        setAddress(defaultAddr.address);
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find(a => a.id === addressId);
    if (selected) {
      setName(selected.name);
      setPhone(selected.phone);
      setAddress(selected.address);
    }
  };

  const handlePlaceOrder = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

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
      // Save address if checkbox is checked
      if (saveAddress && !selectedAddressId) {
        await supabase.from("saved_addresses").insert({
          user_id: session.user.id,
          name,
          phone,
          address,
          is_default: savedAddresses.length === 0
        });
      }

      // Get Fresh Mart store (the main store with products and manager assigned)
      const { data: stores } = await supabase
        .from("stores")
        .select("id, name")
        .eq("is_active", true)
        .not("manager_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!stores || stores.length === 0) {
        throw new Error("No active stores available. Please try again later.");
      }

      const deliveryFee = 20;
      const discount = paymentMethod === "online" ? total * 0.05 : 0;
      const totalAmount = total + deliveryFee - discount;

      // Create order - automatically set to ready_for_pickup via database trigger
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: session.user.id,
          store_id: stores[0].id,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
          subtotal: total,
          delivery_fee: deliveryFee,
          discount_amount: discount,
          total: totalAmount,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "online" ? "paid" : "pending"
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
        body: { order_id: order.id }
      }).catch(err => {
        console.error('Failed to sync order to Google Sheets:', err);
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
        {savedAddresses.length > 0 && (
          <Card className="p-4">
            <h2 className="font-bold text-lg mb-4">Saved Addresses</h2>
            <div className="space-y-2">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => handleAddressSelect(addr.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">{addr.name}</div>
                      <div className="text-sm text-muted-foreground">{addr.phone}</div>
                      <div className="text-sm">{addr.address}</div>
                      {addr.is_default && (
                        <span className="text-xs text-primary font-medium">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h2 className="font-bold text-lg mb-4">
            {selectedAddressId ? "Edit Delivery Details" : "Delivery Details"}
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {!selectedAddressId && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-address"
                  checked={saveAddress}
                  onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                />
                <Label
                  htmlFor="save-address"
                  className="text-sm font-normal cursor-pointer"
                >
                  Save this address for future orders
                </Label>
              </div>
            )}
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
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="cash_on_delivery" id="cod" />
              <Label htmlFor="cod" className="flex-1 cursor-pointer font-normal">
                Cash on Delivery
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-primary/5">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="flex-1 cursor-pointer font-normal">
                <div>
                  <div>Pay Online</div>
                  <div className="text-sm text-primary font-semibold">Get 5% discount!</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Fee</span>
            <span>₹20.00</span>
          </div>
          {paymentMethod === "online" && (
            <div className="flex justify-between text-sm text-primary">
              <span>Online Payment Discount (5%)</span>
              <span>-₹{(total * 0.05).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-primary">
              ₹{(total + 20 - (paymentMethod === "online" ? total * 0.05 : 0)).toFixed(2)}
            </span>
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
