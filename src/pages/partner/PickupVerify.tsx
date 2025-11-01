import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PickupVerify = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          stores (
            name,
            address
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrderDetails(data);
    } catch (error: any) {
      toast.error("Failed to load order details");
      console.error("Error:", error);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast.error("Please enter a 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Use supabase.functions.invoke instead of fetch for proper JWT handling
      const { data, error } = await supabase.functions.invoke('verify-pickup-otp', {
        body: {
          orderId,
          otpCode: otp,
        },
      });

      if (error) {
        throw new Error(error.message || "Verification failed");
      }

      if (!data.success) {
        throw new Error(data.error || "Verification failed");
      }

      toast.success("Pickup verified! Starting delivery...");
      navigate(`/partner/delivery/${orderId}`);
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      toast.error(error.message || "Verification failed");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 4) {
      handleVerifyOTP();
    }
  }, [otp]);

  const remainingAttempts = 3 - attempts;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Pickup</CardTitle>
            <CardDescription>
              Enter the 4-digit OTP from the store manager
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {orderDetails && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">{orderDetails.stores?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {orderDetails.stores?.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Get this code from the store manager when collecting the order
                </p>
                
                <InputOTP
                  maxLength={4}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={loading || attempts >= 3}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>

                {attempts > 0 && remainingAttempts > 0 && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{remainingAttempts} attempts remaining</span>
                  </div>
                )}

                {attempts >= 3 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive font-medium">
                      Maximum attempts exceeded
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please contact the store manager
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 4 || loading || attempts >= 3}
                className="w-full btn-touch"
                size="lg"
              >
                {loading ? (
                  "Verifying..."
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 w-5 h-5" />
                    Verify & Start Delivery
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/partner/orders")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PickupVerify;