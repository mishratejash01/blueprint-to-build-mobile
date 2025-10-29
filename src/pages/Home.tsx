import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  ShoppingCart, 
  Apple, 
  Carrot, 
  Milk, 
  Egg,
  Pizza,
  Coffee,
  User
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";

const iconMap: any = {
  "Vegetables": Carrot,
  "Fruits": Apple,
  "Dairy": Milk,
  "Eggs & Meat": Egg,
  "Snacks": Pizza,
  "Beverages": Coffee,
};

const colorMap: any = {
  "Vegetables": "bg-green-100 text-green-700",
  "Fruits": "bg-red-100 text-red-700",
  "Dairy": "bg-blue-100 text-blue-700",
  "Eggs & Meat": "bg-yellow-100 text-yellow-700",
  "Snacks": "bg-orange-100 text-orange-700",
  "Beverages": "bg-purple-100 text-purple-700",
};

const Home = () => {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .is("parent_id", null)
      .order("name");
    
    setCategories(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .limit(8);
    
    setProducts(data || []);
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Header */}
      <div className="bg-white shadow-soft sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Deliver to</p>
                <p className="font-semibold text-sm">Home - 123 Main St</p>
              </div>
            </div>
            
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>

          <Link to="/search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10 h-12"
                readOnly
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => {
            const Icon = iconMap[category.name] || Carrot;
            const color = colorMap[category.name] || "bg-gray-100 text-gray-700";
            return (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Card className="p-4 text-center hover-lift cursor-pointer">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-12 h-12 mx-auto mb-2 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  <p className="text-sm font-medium">{category.name}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 mb-6">
        <Card className="gradient-accent p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">🎉 Grand Opening!</h3>
          <p className="mb-3">Get 20% off on your first order</p>
          <Button variant="secondary" size="sm">
            Shop Now
          </Button>
        </Card>
      </div>

      {/* Popular Near You */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Popular Near You</h2>
          <Button variant="link" className="text-primary">See All</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="overflow-hidden hover-lift cursor-pointer">
                <div className="aspect-square bg-muted flex items-center justify-center text-6xl">
                  {product.image}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">₹{product.price}</span>
                    <Button size="sm" className="h-8">Add</Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-strong">
        <div className="flex items-center justify-around p-3">
          <Button variant="ghost" className="flex-col h-auto py-2">
            <ShoppingCart className="w-5 h-5 mb-1 text-primary" />
            <span className="text-xs font-medium text-primary">Home</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2">
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs">Search</span>
          </Button>
          <Button variant="ghost" className="flex-col h-auto py-2">
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Cart</span>
          </Button>
          <Link to="/profile">
            <Button variant="ghost" className="flex-col h-auto py-2">
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Home;
