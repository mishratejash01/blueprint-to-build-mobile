import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

interface CategoryScrollProps {
  categories: Category[];
  title?: string;
}

const CategoryScroll = ({ categories, title = "Shop by Category" }: CategoryScrollProps) => {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] px-4">
          {title}
        </h2>
      )}
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 px-4 pb-2">
          {categories.map((category, index) => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className="inline-block"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="category-card w-[140px] h-[160px] flex flex-col items-center justify-center gap-3 border border-border bg-white overflow-hidden p-4 cursor-pointer">
                {category.image_url ? (
                  <div className="w-full h-[100px] flex items-center justify-center">
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-primary" strokeWidth={1.5} />
                  </div>
                )}
                <span className="text-sm text-center font-semibold text-[hsl(var(--text-primary))] line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default CategoryScroll;
