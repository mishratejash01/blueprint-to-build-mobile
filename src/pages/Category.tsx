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
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="hover:bg-primary/10 hover:scale-110 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {categoryName}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-background/50 rounded-xl p-2 border">
            <SlidersHorizontal className="h-4 w-4 text-primary ml-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 bg-transparent border-none px-2 py-2 text-sm focus:outline-none cursor-pointer"
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
          <Card className="border-none shadow-medium animate-fade-in">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <p className="text-muted-foreground text-center mb-2 text-lg font-medium">
                No products found
              </p>
              <p className="text-muted-foreground/70 text-sm mb-6">
                Try browsing other categories
              </p>
              <Button 
                className="gradient-primary hover:opacity-90 shadow-lg"
                onClick={() => navigate("/home")}
              >
                Browse All Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer border-none shadow-soft hover:shadow-strong transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10"></div>
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-3">{product.unit}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-primary">₹{product.price}</span>
                      <Button
                        size="sm"
                        className="h-9 px-4 gradient-primary hover:opacity-90 shadow-md hover:shadow-lg transition-all hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        Add
                      </Button>
                    </div>
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
