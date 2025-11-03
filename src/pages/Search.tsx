import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SearchEmptyState from "@/components/SearchEmptyState";
import { Link } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .eq("is_available", true)
      .limit(20);

    setResults(data || []);
    setLoading(false);
  };

  return (
    <div className="bg-background">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Search</h1>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
            autoFocus
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : results.length === 0 && searchQuery.trim() ? (
          <SearchEmptyState searchQuery={searchQuery} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {results.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="overflow-hidden hover-lift cursor-pointer">
                  <div className="aspect-square bg-white p-4 border-b border-border">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-6xl">🛒</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🛒
                      </div>
                    )}
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
        )}
      </div>
    </div>
  );
};

export default Search;
