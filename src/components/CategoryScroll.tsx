import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getCategoryImage } from "@/lib/categoryImages";

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

interface CategoryScrollProps {
  categories?: Category[];
  title?: string;
}

const CategoryScroll = ({ categories = [], title = "Shop by Category" }: CategoryScrollProps) => {
  // Safety check - ensure we have a valid array
  const validCategories = Array.isArray(categories) ? categories.filter(cat => cat?.id) : [];
  
  if (validCategories.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] px-4">
          {title}
        </h2>
      )}
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4 pb-2">
          {validCategories.map((category, index) => {
            const categoryImg = getCategoryImage(category.name) || category.image_url;
            
            return (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="inline-block"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="category-card w-[140px] h-[160px] flex flex-col items-center justify-center gap-3 border border-border bg-white overflow-hidden p-4 cursor-pointer hover:shadow-elegant hover:border-primary/30 hover:-translate-y-1 transition-all group">
                {categoryImg ? (
                  <div className="w-full h-[100px] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src={categoryImg} 
                      alt={category.name}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-subtle rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-elegant transition-shadow">
                    <ShoppingBag className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  </div>
                )}
                <span className="text-sm text-center font-bold text-[hsl(var(--text-primary))] line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Card>
            </Link>
          )})}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default CategoryScroll;
