import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive"
        });
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, toast]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity,
      unit: product.unit,
      image: product.image_url || "🛒"
    });

    toast({
      title: "Added to cart!",
      description: `${quantity} ${product.name} added`
    });

    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24">
      <div className="sticky top-0 bg-card/80 backdrop-blur-lg border-b z-10 p-4 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="hover:bg-primary/10 hover:scale-110 transition-all"
        >
          <ArrowLeft />
        </Button>
      </div>

      <div className="relative aspect-square bg-gradient-primary flex items-center justify-center text-8xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <span className="relative z-10 animate-scale-in">🛒</span>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="animate-fade-in">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
            {product.category || "Product"}
          </div>
          <h1 className="text-4xl font-bold mb-3 leading-tight">{product.name}</h1>
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            {product.unit}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-primary">₹{product.price}</p>
            <span className="text-sm text-muted-foreground">per {product.unit}</span>
          </div>
        </div>

        {product.description && (
          <Card className="border-none shadow-soft p-5 hover-lift animate-slide-up">
            <h3 className="font-bold mb-3 text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </Card>
        )}

        <Card className="border-none shadow-medium p-5 bg-gradient-subtle animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">Quantity</span>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-12 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center bg-card px-4 py-2 rounded-lg">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all hover:scale-110"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t p-5 shadow-strong">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">
              ₹{(parseFloat(product.price) * quantity).toFixed(2)}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{quantity} × ₹{product.price}</p>
          </div>
        </div>
        <Button 
          onClick={handleAddToCart} 
          className="w-full btn-touch gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg font-semibold"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
