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
    <div className="min-h-screen flex flex-col gradient-subtle relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-6 py-8 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary mb-8 shadow-primary animate-scale-in">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
            <MapPin className="w-12 h-12 text-white relative z-10" strokeWidth={2} />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            Choose Your Location
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            To find the <span className="text-primary font-semibold">freshest items</span> closest to you
          </p>
        </div>

        <div className="w-full space-y-5 animate-slide-up">
          <Button
            onClick={handleUseCurrentLocation}
            disabled={loading}
            size="lg"
            className="w-full btn-touch gradient-primary hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Navigation className="mr-2 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">{loading ? "Detecting..." : "Use Current Location"}</span>
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 backdrop-blur-sm px-4 py-1 text-muted-foreground rounded-full border">Or enter manually</span>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border shadow-soft hover-lift">
            <Input
              type="text"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-12 border-border/50 focus:border-primary transition-all duration-300"
            />
            
            <Button
              onClick={handleConfirmAddress}
              disabled={!address.trim()}
              size="lg"
              className="w-full btn-touch bg-card border-2 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-card disabled:hover:text-primary"
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
