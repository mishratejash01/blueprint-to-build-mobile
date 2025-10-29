import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ShoppingCart, User, Home as HomeIcon } from "lucide-react";
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
      {/* Sticky Header - Blinkit Style */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl text-[hsl(var(--text-primary))] hidden sm:inline">
                VeggieIt
              </span>
            </Link>
            
            {/* Delivery Location */}
            <div className="flex items-center gap-2 group cursor-pointer flex-1 max-w-xs">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                  Delivery in 30 min
                </p>
                <p className="font-semibold text-sm text-[hsl(var(--text-primary))] truncate">
                  Home - Bangalore
                </p>
              </div>
            </div>
            
            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <div className="bg-primary/10 p-2.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Search Bar - Prominent */}
          <Link to="/search" className="block mt-3">
            <div className="flex items-center gap-3 bg-[hsl(var(--input))] px-4 py-3 rounded-lg hover:bg-[hsl(var(--muted))] transition-all group">
              <Search className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
              <span className="text-[hsl(var(--text-secondary))] text-sm">
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

      {/* Bottom Navigation - Clean & Modern */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-strong z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-around px-4 py-3">
          <Link to="/home" className="flex flex-col items-center gap-1.5 min-w-[60px]">
            <div className="bg-primary/10 p-2 rounded-xl">
              <HomeIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-semibold text-primary">Home</span>
          </Link>
          
          <Link to="/search" className="flex flex-col items-center gap-1.5 min-w-[60px] group">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
              <Search className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Search
            </span>
          </Link>
          
          <Link to="/cart" className="flex flex-col items-center gap-1.5 min-w-[60px] group relative">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
              <ShoppingCart className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
              Cart
            </span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center gap-1.5 min-w-[60px] group">
            <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
              <User className="h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
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
