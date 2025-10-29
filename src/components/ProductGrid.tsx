import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import InlineCartControl from "./InlineCartControl";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url?: string;
}

interface ProductGridProps {
  products: Product[];
  title?: string;
}

const ProductGrid = ({ products, title = "Best Sellers" }: ProductGridProps) => {
  return (
    <div className="space-y-4 px-4">
      {title && (
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
          {title}
        </h2>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.filter(p => p?.id).map((product, index) => (
          <div 
            key={product.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Link to={`/product/${product.id}`}>
              <Card className="product-card group overflow-hidden border border-border">
                {/* Product Image */}
                <div className="relative aspect-square bg-white p-4 border-b border-border">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🛒
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="p-3 space-y-2 bg-white">
                  <h3 className="font-semibold text-sm text-[hsl(var(--text-primary))] line-clamp-2 min-h-[2.5rem] leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {product.unit}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-lg text-[hsl(var(--text-primary))]">
                      ₹{product.price}
                    </span>
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
  );
};

export default ProductGrid;
