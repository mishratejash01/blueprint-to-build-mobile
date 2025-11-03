import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// THIS IS THE CORRECTED IMPORT LINE:
import { Search, MapPin, ShoppingCart, Sparkles, Leaf } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import CategoryScroll from "@/components/CategoryScroll";
import ProductGrid from "@/components/ProductGrid";
import HeroBanner from "@/components/HeroBanner";
// No other imports needed

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
    {/* This div is now the wrapper, layout handles padding */}
    <div>
      {/* Sticky Header - Replaced shadow-premium with standard shadow-sm */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo - shadow-glow removed */}
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-primary p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                <Leaf className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent hidden sm:inline">
                VeggieIt
              </span>
            </Link>
            
            {/* Delivery Location */}
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
            
            {/* Cart Icon - shadow-elegant and shadow-glow removed */}
            <Link to="/cart" className="relative group">
              <div className="bg-gradient-primary p-3 rounded-xl group-hover:scale-105 transition-all">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-strong animate-scale-in ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Search Bar */}
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

      {/* Bottom Nav is rendered by CustomerLayout.tsx */}
    </div>
    </ProtectedRoute>
  );
};

export default Home;
