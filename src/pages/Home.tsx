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
  User,
  Home as HomeIcon,
  Zap,
  ShoppingBag
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import InlineCartControl from "@/components/InlineCartControl";

const iconMap: any = {
  "Vegetables": Carrot,
  "Fruits": Apple,
  "Dairy": Milk,
  "Eggs & Meat": Egg,
  "Snacks": Pizza,
  "Beverages": Coffee,
};

const colorMap: any = {
  "Vegetables": "text-primary",
  "Fruits": "text-accent",
  "Dairy": "text-primary",
  "Eggs & Meat": "text-accent",
  "Snacks": "text-primary",
  "Beverages": "text-accent",
};

const Home = () => {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    // Fetch all categories
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (data) {
      // Separate top-level and subcategories
      const topLevel = data.filter((cat: any) => cat.parent_id === null);
      const subCats: Record<string, any[]> = {};
      
      data.forEach((cat: any) => {
        if (cat.parent_id) {
          if (!subCats[cat.parent_id]) {
            subCats[cat.parent_id] = [];
          }
          subCats[cat.parent_id].push(cat);
        }
      });
      
      setTopCategories(topLevel);
      setSubCategories(subCats);
    }
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
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Delivering to</p>
                <p className="font-bold text-sm text-foreground">Home - Bangalore</p>
              </div>
            </div>
            <Link to="/cart" className="relative group">
              <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-all group-hover:scale-110">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          <Link to="/search">
            <div className="flex items-center gap-3 bg-background/50 px-4 py-3 rounded-xl border hover:border-primary/50 transition-all hover:shadow-md group">
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">Search for products...</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Categories - Blinkit Style */}
      <div className="p-4 space-y-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold">Shop by Category</h2>
        </div>
        
        {topCategories.map((topCategory, topIndex) => {
          const Icon = iconMap[topCategory.name] || ShoppingBag;
          const subs = subCategories[topCategory.id] || [];
          
          return (
            <div key={topCategory.id} className="animate-fade-in" style={{ animationDelay: `${topIndex * 100}ms` }}>
              {/* Top Category Header */}
              <Link to={`/category/${topCategory.id}`}>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-subtle hover:bg-primary/5 transition-all group cursor-pointer">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{topCategory.name}</h3>
                </div>
              </Link>
              
              {/* Subcategories Grid */}
              {subs.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-2">
                  {subs.slice(0, 8).map((subCat: any, subIndex: number) => (
                    <Link key={subCat.id} to={`/category/${subCat.id}`}>
                      <Card 
                        className="h-28 flex flex-col items-center justify-center gap-2 border-none shadow-soft hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer group bg-card/50 backdrop-blur-sm"
                        style={{ animationDelay: `${(topIndex * 100) + (subIndex * 30)}ms` }}
                      >
                        {subCat.image_url ? (
                          <img 
                            src={subCat.image_url} 
                            alt={subCat.name}
                            className="h-12 w-12 object-contain group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-all">
                            <ShoppingBag className="h-6 w-6 text-primary" strokeWidth={1.5} />
                          </div>
                        )}
                        <span className="text-xs text-center font-semibold line-clamp-2 px-2 group-hover:text-primary transition-colors">
                          {subCat.name}
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* View All Link */}
              {subs.length > 8 && (
                <Link to={`/category/${topCategory.id}`}>
                  <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 mt-2">
                    View All {topCategory.name} →
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Banner */}
      <div className="px-4 py-2">
        <Card className="relative overflow-hidden gradient-primary text-white p-8 border-none shadow-strong hover-lift group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 animate-pulse" />
              Fresh Groceries
            </h3>
            <p className="text-sm text-white/90 mb-4 font-medium">Delivered in under 30 minutes ⚡</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Shop Now
            </Button>
          </div>
        </Card>
      </div>

      {/* Popular Products */}
      <div className="p-4 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-accent rounded-full"></div>
          <h2 className="text-2xl font-bold">Popular Near You</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <Link to={`/product/${product.id}`}>
                <Card 
                  className="group overflow-hidden border-none shadow-soft hover:shadow-strong transition-all hover:-translate-y-2 animate-fade-in bg-card/50 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative aspect-square bg-gradient-subtle flex items-center justify-center text-4xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <span className="group-hover:scale-110 transition-transform duration-300">🛒</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">{product.unit}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-primary">₹{product.price}</span>
                      <div onClick={(e) => e.preventDefault()}>
                        <InlineCartControl product={product} />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t shadow-strong z-50">
        <div className="flex items-center justify-around p-3">
          <Link to="/home" className="flex flex-col items-center gap-1 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-all">
              <HomeIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary">Home</span>
          </Link>
          <Link to="/search" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-all">
              <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Search</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-1 group relative">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-all">
              <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Cart</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-all">
              <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Profile</span>
          </Link>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default Home;
