import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const StoreInventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "kg",
    stock_level: "",
    category_id: "",
    category: "",
    image_url: "",
    description: ""
  });

  useEffect(() => {
    fetchStoreAndProducts();
    fetchCategories();
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

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, parent_id")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    setCategories(data || []);
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

    console.log('💾 Saving product with category_id:', formData.category_id);
    console.log('📦 Full form data:', formData);

    const productData = {
      store_id: storeId,
      name: formData.name,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock_quantity: parseInt(formData.stock_level),
      category_id: formData.category_id || null,
      category: formData.category,
      image_url: formData.image_url || null,
      description: formData.description || null,
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
    setFormData({ name: "", price: "", unit: "kg", stock_level: "", category_id: "", category: "", image_url: "", description: "" });
    fetchStoreAndProducts();
  };

  const handleDelete = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Product deleted successfully"
    });

    fetchStoreAndProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      stock_level: product.stock_quantity?.toString() || product.stock_level?.toString() || "0",
      category_id: product.category_id || "",
      category: product.category || "",
      image_url: product.image_url || "",
      description: product.description || ""
    });
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={["store_manager"]}>
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
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => {
                        console.log('✅ Selected category ID:', value);
                        const selectedCategory = categories.find(c => c.id === value);
                        console.log('📂 Found category:', selectedCategory);
                        setFormData({ 
                          ...formData, 
                          category_id: value,
                          category: selectedCategory?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto bg-background z-50">
                        {categories.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No categories available
                          </div>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      placeholder="https://example.com/product-image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    {formData.image_url && (
                      <div className="mt-2 border rounded-lg p-2 bg-muted/50">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = '❌ Invalid image URL';
                            e.currentTarget.className = 'w-full h-32 flex items-center justify-center text-muted-foreground';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Product description, ingredients, or additional details..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
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
            products.map((product) => {
              const stockLevel = product.stock_quantity ?? product.stock_level ?? 0;
              const stockColor = stockLevel > 10 ? "text-green-600" : stockLevel > 0 ? "text-yellow-600" : "text-red-600";
              
              return (
                <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = '🛒';
                          e.currentTarget.className = 'w-20 h-20 flex items-center justify-center text-4xl bg-muted rounded-lg';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center text-4xl bg-muted rounded-lg">
                        🛒
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price} per {product.unit}
                          </p>
                          {product.category && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                              {product.category}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{product.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <p className={stockColor}>
                          Stock: <span className="font-semibold">{stockLevel}</span>
                        </p>
                        {product.description && (
                          <p className="text-muted-foreground truncate">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default StoreInventory;
