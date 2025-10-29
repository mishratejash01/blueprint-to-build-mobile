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
          className="h-9 px-5 gradient-primary hover:opacity-90 shadow-md hover:shadow-lg transition-all hover:scale-105 text-sm font-semibold relative overflow-hidden group"
          onClick={handleAddToCart}
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
          <span className="relative">Add</span>
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
      className="flex items-center gap-2 bg-primary/10 rounded-lg p-1 shadow-md animate-scale-in"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-md hover:bg-destructive/20 hover:text-destructive transition-all hover:scale-110 active:scale-95"
        onClick={handleDecrement}
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} />
      </Button>
      
      <span className="min-w-[28px] text-center font-bold text-primary text-sm animate-fade-in">
        {quantity}
      </span>
      
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-md hover:bg-primary/20 hover:text-primary transition-all hover:scale-110 active:scale-95"
        onClick={handleIncrement}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </Button>
    </div>
  );
};

export default InlineCartControl;
