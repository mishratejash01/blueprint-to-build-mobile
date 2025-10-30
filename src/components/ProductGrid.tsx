import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import InlineCartControl from "./InlineCartControl";
import { getProductImage } from "@/lib/productImages";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url?: string;
  is_available?: boolean;
  store_id?: string;
}

interface ProductGridProps {
  products?: Product[];
  title?: string;
}

const ProductGrid = ({ products = [], title = "Best Sellers" }: ProductGridProps) => {
  // Safety check - ensure we have a valid array
  const validProducts = Array.isArray(products) ? products.filter(p => p?.id) : [];
  
  if (validProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 px-4">
      {title && (
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">
          {title}
        </h2>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validProducts.map((product, index) => {
          // Try to get image from local assets first, fall back to database URL
          const productKey = product.name.toLowerCase().replace(/\s+/g, '-');
          const localImage = getProductImage(productKey);
          const productImage = localImage || product.image_url;
          
          return (
          <div 
            key={product.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Link to={`/product/${product.id}`}>
              <Card className={`product-card group overflow-hidden border border-border ${!product.is_available ? 'opacity-60' : ''}`}>
                {/* Product Image */}
                <div className="relative aspect-square bg-white p-4 border-b border-border">
                  {productImage ? (
                    <img 
                      src={productImage} 
                      alt={product.name}
                      className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${!product.is_available ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🛒
                    </div>
                  )}
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-destructive text-white px-3 py-1 rounded-md text-sm font-semibold">
                        Out of Stock
                      </span>
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
                    {product.is_available !== false ? (
                      <div onClick={(e) => e.preventDefault()}>
                        <InlineCartControl product={product} />
                      </div>
                    ) : (
                      <span className="text-xs text-destructive font-medium">Store Closed</span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )})}
      </div>
    </div>
  );
};

export default ProductGrid;
