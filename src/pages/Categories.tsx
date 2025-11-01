import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/utils/errorHandling";
import { categoryImages } from "@/lib/categoryImages";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      handleSupabaseError(error, "load categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageForCategory = (category: Category) => {
    const key = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return categoryImages[key] || category.image_url;
  };

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="min-h-screen bg-gradient-subtle pb-safe-bottom">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b shadow-elegant">
          <div className="flex items-center gap-3 p-4 pt-safe-top">
            <button
              onClick={() => navigate("/home")}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold flex-1">All Categories</h1>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="p-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="overflow-hidden cursor-pointer hover:shadow-premium transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="aspect-square p-3 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-background to-accent/5">
                    {getImageForCategory(category) ? (
                      <img
                        src={getImageForCategory(category)}
                        alt={category.name}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <span className="text-4xl">🏪</span>
                    )}
                    <p className="text-xs font-medium text-center line-clamp-2">
                      {category.name}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No categories found</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Categories;
