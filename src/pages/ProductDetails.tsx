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
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
      </div>

      <div className="aspect-square bg-muted flex items-center justify-center text-8xl">
        {product.image_url || "🛒"}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-muted-foreground mb-1">{product.unit}</p>
          <p className="text-2xl font-bold text-primary">₹{product.price}</p>
        </div>

        {product.description && (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        )}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Quantity</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">
            ₹{(parseFloat(product.price) * quantity).toFixed(2)}
          </span>
        </div>
        <Button onClick={handleAddToCart} className="w-full btn-touch">
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;
