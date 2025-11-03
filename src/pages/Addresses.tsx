import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", address: "" });

  useEffect(() => {
    // For now, using localStorage. In production, this would be in Supabase
    const savedAddresses = localStorage.getItem("addresses");
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
    setLoading(false);
  }, []);

  const saveAddresses = (updatedAddresses: Address[]) => {
    localStorage.setItem("addresses", JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      toast.error("Please fill in all fields");
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      label: newAddress.label,
      address: newAddress.address,
      is_default: addresses.length === 0,
    };

    saveAddresses([...addresses, address]);
    setNewAddress({ label: "", address: "" });
    setDialogOpen(false);
    toast.success("Address added successfully!");
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    saveAddresses(updatedAddresses);
    toast.success("Address deleted");
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id,
    }));
    saveAddresses(updatedAddresses);
    toast.success("Default address updated");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="sticky top-0 z-10 bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">My Addresses</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Home, Office"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address with landmark"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddAddress} className="w-full">
                  Save Address
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No saved addresses yet
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? "border-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{address.label}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-3 ml-7">{address.address}</p>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-7"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
                {address.is_default && (
                  <span className="text-xs text-primary font-medium ml-7">Default Address</span>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;
