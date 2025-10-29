import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const StoreInventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "kg",
    stock_level: "",
    category: ""
  });

  useEffect(() => {
    fetchStoreAndProducts();
  }, []);

  const fetchStoreAndProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("manager_id", user.id)
      .single();

    if (store) {
      setStoreId(store.id);
      
      // Get products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      setProducts(productsData || []);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      toast({
        title: "Error",
        description: "Store not found",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      store_id: storeId,
      name: formData.name,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock_level: parseInt(formData.stock_level),
      category: formData.category,
      is_available: true
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: `Product ${editingProduct ? "updated" : "added"} successfully`
    });

    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", unit: "kg", stock_level: "", category: "" });
    fetchStoreAndProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      stock_level: product.stock_level.toString(),
      category: product.category || ""
    });
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft />
              </Button>
              <h1 className="text-xl font-bold">Inventory</h1>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock_level}
                      onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {products.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" />
                Add Your First Product
              </Button>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₹{product.price} per {product.unit}
                    </p>
                    <p className="text-sm">
                      Stock: {product.stock_level}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreInventory;
