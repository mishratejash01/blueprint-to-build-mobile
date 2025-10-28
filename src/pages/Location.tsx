import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Location = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUseCurrentLocation = () => {
    setLoading(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          toast({
            title: "Location detected!",
            description: "Finding the freshest items closest to you",
          });
          navigate("/home");
        },
        (error) => {
          setLoading(false);
          toast({
            title: "Location access denied",
            description: "Please enter your address manually",
            variant: "destructive"
          });
        }
      );
    } else {
      setLoading(false);
      toast({
        title: "Location not supported",
        description: "Please enter your address manually",
        variant: "destructive"
      });
    }
  };

  const handleConfirmAddress = () => {
    if (address.trim()) {
      toast({
        title: "Address saved!",
        description: "Getting fresh products for you",
      });
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Choose Your Location
          </h1>
          
          <p className="text-muted-foreground text-lg">
            To find the freshest items closest to you
          </p>
        </div>

        <div className="w-full space-y-4">
          <Button
            onClick={handleUseCurrentLocation}
            disabled={loading}
            size="lg"
            className="w-full btn-touch gradient-primary hover:opacity-90"
          >
            <Navigation className="mr-2" />
            {loading ? "Detecting..." : "Use Current Location"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-12"
            />
            
            <Button
              onClick={handleConfirmAddress}
              disabled={!address.trim()}
              size="lg"
              variant="outline"
              className="w-full btn-touch"
            >
              Confirm Address
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
