import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Phone, MapPin, Package, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { playOrderSound, showNotification, requestNotificationPermission } from "@/utils/notifications";

const StoreOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [pickupOtps, setPickupOtps] = useState<Record<string, any>>({});
  const [activeFilter, setActiveFilter] = useState<string>(searchParams.get("filter") || "all");

  useEffect(() => {
    requestNotificationPermission();
    fetchOrders();
    subscribeToUpdates();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const subscribeToUpdates = () => {
    // Subscribe to new orders
    supabase
      .channel("store-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders"
        },
        (payload) => {
          playOrderSound();
          showNotification(
            "New Order! 🎉",
            `Order #${payload.new.id.slice(0, 8)} - ₹${payload.new.total}`
          );
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders"
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    // Subscribe to OTP generation
    supabase
      .channel("pickup-otps")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_pickup_otps"
        },
        () => {
          fetchPickupOtps();
        }
      )
      .subscribe();
  };

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .or(`manager_id.eq.${user.id},authorized_users.cs.{${user.id}}`)
        .single();

      if (store) {
        const { data: ordersData } = await supabase
          .from("orders")
          .select(`
            *,
            order_items(*)
          `)
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });

        // Fetch delivery partner info for orders with partners assigned
        if (ordersData) {
          const ordersWithPartnerInfo = await Promise.all(
            ordersData.map(async (order) => {
              if (order.delivery_partner_id) {
                const { data: partner } = await supabase
                  .from("profiles")
                  .select("full_name, phone")
                  .eq("id", order.delivery_partner_id)
                  .single();

                return { ...order, delivery_partner: partner };
              }
              return order;
            })
          );

          setOrders(ordersWithPartnerInfo);
        }

        fetchPickupOtps();
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPickupOtps = async () => {
    try {
      const { data: otps } = await supabase
        .from("store_pickup_otps")
        .select("*")
        .eq("is_verified", false);

      if (otps) {
        const otpMap = otps.reduce((acc, otp) => {
          acc[otp.order_id] = otp;
          return acc;
        }, {} as Record<string, any>);
        setPickupOtps(otpMap);
      }
    } catch (error) {
      console.error("Error fetching OTPs:", error);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "ready_for_pickup" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order marked as ready for pickup");
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleHandOver = async (orderId: string, handedOver: boolean) => {
    // This toggle doesn't directly change order status
    // It's just a UI indicator that store manager has handed over the order
    // The actual status change happens when delivery partner verifies OTP
    if (handedOver) {
      toast.success("Marked as handed over. Waiting for partner to verify OTP.");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ready_for_pickup: "bg-blue-100 text-blue-800 border-blue-200",
      awaiting_pickup_verification: "bg-purple-100 text-purple-800 border-purple-200",
      in_transit: "bg-orange-100 text-orange-800 border-orange-200",
      delivered: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} min` : "Expired";
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return order.status === "pending" || order.status === "ready_for_pickup";
    if (activeFilter === "active") return order.status === "awaiting_pickup_verification" || order.status === "in_transit";
    if (activeFilter === "completed") return order.status === "delivered";
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background border-b z-10 p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Orders</h1>
          </div>
          
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                {orders.filter(o => o.status === "pending" || o.status === "ready_for_pickup").length > 0 && (
                  <Badge className="ml-2 bg-accent text-accent-foreground">
                    {orders.filter(o => o.status === "pending" || o.status === "ready_for_pickup").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                {orders.filter(o => o.status === "awaiting_pickup_verification" || o.status === "in_transit").length > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {orders.filter(o => o.status === "awaiting_pickup_verification" || o.status === "in_transit").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeFilter === "all" ? "No orders yet" : `No ${activeFilter} orders`}
              </p>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const otp = pickupOtps[order.id];
              const isExpired = otp && new Date(otp.expires_at) < new Date();
              
              return (
                <Card key={order.id} className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-3xl font-bold text-primary mt-1">
                        ₹{order.total.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {order.customer_name || "Customer"}
                      </span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${order.customer_phone}`} className="text-sm text-primary hover:underline">
                          {order.customer_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items ({order.order_items?.length || 0})
                    </p>
                    <div className="space-y-1">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          DELIVERY ADDRESS
                        </p>
                        <p className="text-sm">{order.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Partner Info */}
                  {order.delivery_partner && (
                    <div className="bg-primary/5 rounded-lg p-3 space-y-2 border border-primary/20">
                      <p className="text-xs font-semibold text-primary mb-2">
                        🚴 DELIVERY PARTNER
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{order.delivery_partner.full_name}</span>
                        {order.delivery_partner.phone && (
                          <a 
                            href={`tel:${order.delivery_partner.phone}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {order.delivery_partner.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* OTP Display */}
                  {otp && !isExpired && (
                    <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 text-center space-y-2">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Pickup OTP
                      </p>
                      <p className="text-5xl font-bold font-mono tracking-widest text-primary animate-pulse">
                        {otp.otp_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Valid for {getTimeRemaining(otp.expires_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Share this code with delivery partner
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status === "pending" && (
                    <Button
                      onClick={() => handleMarkReady(order.id)}
                      className="w-full btn-touch"
                      size="lg"
                    >
                      Mark as Ready for Pickup
                    </Button>
                  )}

                  {order.status === "ready_for_pickup" && order.delivery_partner_id && otp && (
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <Label htmlFor={`handover-${order.id}`} className="text-sm font-medium cursor-pointer">
                        Handed over to partner
                      </Label>
                      <Switch
                        id={`handover-${order.id}`}
                        onCheckedChange={(checked) => handleHandOver(order.id, checked)}
                      />
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreOrders;