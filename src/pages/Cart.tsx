import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      	<div className="min-h-screen bg-background pb-28">
        <header className="sticky top-0 bg-background border-b z-10 p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Cart</h1>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add items to place your order.</p>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <Button onClick={() => navigate("/home")} className="w-full btn-touch">
            Start Shopping
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Cart</h1>
            <p className="text-sm text-muted-foreground">{itemCount} items</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-48 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-3xl">
                {item.image}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.unit}</p>
                <p className="text-lg font-bold text-primary mt-1">₹{item.price}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4 z-40">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-semibold">₹20.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-primary">₹{(total + 20).toFixed(2)}</span>
          </div>
        </div>
        <Button onClick={() => navigate("/checkout")} className="w-full btn-touch">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
