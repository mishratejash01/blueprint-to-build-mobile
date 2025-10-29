import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import AddToCartAnimation from "./AddToCartAnimation";

interface InlineCartControlProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string;
  };
  onAdd?: () => void;
}

const InlineCartControl = ({ product, onAdd }: InlineCartControlProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStart, setAnimationStart] = useState({ x: 0, y: 0 });
  
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Get button position for animation
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setAnimationStart({
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top + buttonRect.height / 2
    });
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      image: product.image_url || "/placeholder.svg",
    });
    
    setShowAnimation(true);
    
    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    onAdd?.();
  };

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (cartItem) {
      updateQuantity(product.id, quantity + 1);
      
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (cartItem) {
      if (quantity === 1) {
        toast.success(`${product.name} removed from cart`);
      }
      updateQuantity(product.id, quantity - 1);
      
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  if (quantity === 0) {
    return (
      <>
        <Button
          size="sm"
          className="h-9 px-6 bg-primary hover:bg-[hsl(var(--primary-hover))] text-white font-medium text-xs uppercase tracking-wide rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
          onClick={handleAddToCart}
        >
          ADD
        </Button>
        
        <AddToCartAnimation
          show={showAnimation}
          productImage={product.image_url || "🛒"}
          startPosition={animationStart}
          endPosition={{ x: window.innerWidth - 50, y: 50 }}
          onComplete={() => setShowAnimation(false)}
        />
      </>
    );
  }

  return (
    <div 
      className="flex items-center gap-1.5 bg-primary rounded-lg p-0.5 shadow-sm animate-scale-in"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-md hover:bg-white/20 text-white transition-all active:scale-90"
        onClick={handleDecrement}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </Button>
      
      <span className="min-w-[24px] text-center font-bold text-white text-sm">
        {quantity}
      </span>
      
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-md hover:bg-white/20 text-white transition-all active:scale-90"
        onClick={handleIncrement}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </Button>
    </div>
  );
};

export default InlineCartControl;
