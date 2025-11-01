import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ShoppingCart, User, Home as HomeIcon, LayoutGrid, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import CategoryScroll from "@/components/CategoryScroll";
import ProductGrid from "@/components/ProductGrid";
import HeroBanner from "@/components/HeroBanner";
import { Leaf } from "lucide-react";

const Home = () => {
  const { itemCount } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .limit(12);
      
      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }
      
      if (data) {
        setCategories(data.filter(cat => cat?.id));
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .limit(8);
      
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      
      setProducts((data || []).filter(p => p?.id));
    } catch (error) {
      console.error("Error in fetchProducts:", error);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-20">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-premium backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Premium Logo */}
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-primary p-2.5 rounded-xl shadow-glow group-hover:scale-105 transition-transform">
                <Leaf className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent hidden sm:inline">
                VeggieIt
              </span>
            </Link>
            
            {/* Premium Delivery Location */}
            <div className="flex items-center gap-2.5 group cursor-pointer flex-1 max-w-xs hover:bg-primary/5 p-2 rounded-xl transition-all">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[hsl(var(--text-secondary))] font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Delivery in 30 min
                </p>
                <p className="font-bold text-sm text-[hsl(var(--text-primary))] truncate">
                  Home - Bangalore
                </p>
              </div>
            </div>
            
            {/* Premium Cart Icon */}
            <Link to="/cart" className="relative group">
              <div className="bg-gradient-primary p-3 rounded-xl shadow-elegant group-hover:shadow-glow group-hover:scale-105 transition-all">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-strong animate-scale-in ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Premium Search Bar */}
          <Link to="/search" className="block mt-3">
            <div className="flex items-center gap-3 bg-gradient-subtle px-4 py-3.5 rounded-xl border border-border hover:border-primary/50 hover:shadow-elegant transition-all group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[hsl(var(--text-secondary))] text-sm font-medium">
                Search for vegetables, fruits, & more...
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="mt-6">
        <HeroBanner />
      </div>

      {/* Shop by Category - Horizontal Scroll */}
      <div className="mt-8">
        <CategoryScroll categories={categories} />
      </div>

      {/* Popular Products Grid */}
      <div className="mt-10 pb-8">
        <ProductGrid products={products} title="Best Sellers" />
      </div>

      {/* Premium Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border shadow-premium z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          <Link to="/home" className="flex flex-col items-center gap-1 min-w-[70px] py-1">
            <div className="bg-gradient-primary p-2.5 rounded-xl shadow-elegant">
              <HomeIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-primary">Home</span>
          </Link>
          
          <Link to="/search" className="flex flex-col items-center gap-1 min-w-[70px] py-1 group">
            <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:shadow-elegant transition-all">
              <Search className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Search
            </span>
          </Link>
          
          <Link to="/categories" className="flex flex-col items-center gap-1 min-w-[70px] py-1 group">
            <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:shadow-elegant transition-all">
              <LayoutGrid className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Categories
            </span>
          </Link>
          
          <Link to="/cart" className="flex flex-col items-center gap-1 min-w-[70px] py-1 group relative">
            <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:shadow-elegant transition-all">
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-glow ring-2 ring-white animate-scale-in">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Cart
            </span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center gap-1 min-w-[70px] py-1 group">
            <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:shadow-elegant transition-all">
              <User className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </div>
    </ProtectedRoute>
  );
};

export default Home;
