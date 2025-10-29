import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import AddToCartAnimation from "@/components/AddToCartAnimation";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  unit: string;
  category: string;
  stock_quantity: number;
}

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatingProductId, setAnimatingProductId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");

  useEffect(() => {
    fetchProducts();
  }, [categoryId, sortBy]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_available", true);

      if (categoryId && categoryId !== "all") {
        query = query.eq("category", categoryId);
      }

      // Apply sorting
      if (sortBy === "name") {
        query = query.order("name", { ascending: true });
      } else if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setAnimatingProductId(product.id);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      image: product.image_url || "/placeholder.svg",
    });
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAnimatingProductId(null), 600);
  };

  const categoryName = categoryId === "all" ? "All Products" : 
    categoryId?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{categoryName}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 bg-background border rounded-md px-3 py-2 text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No products found in this category
              </p>
              <Button className="mt-4" onClick={() => navigate("/home")}>
                Browse All Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardContent className="p-3">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-2">{product.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">₹{product.price}</span>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
