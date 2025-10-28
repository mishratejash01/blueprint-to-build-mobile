import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Location from "./pages/Location";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import StoreDashboard from "./pages/store/StoreDashboard";
import StoreInventory from "./pages/store/StoreInventory";
import StoreOrders from "./pages/store/StoreOrders";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrders from "./pages/partner/PartnerOrders";
import ActiveDelivery from "./pages/partner/ActiveDelivery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/location" element={<Location />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/track/:orderId" element={<OrderTracking />} />
            <Route path="/store/dashboard" element={<StoreDashboard />} />
            <Route path="/store/inventory" element={<StoreInventory />} />
            <Route path="/store/orders" element={<StoreOrders />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/orders" element={<PartnerOrders />} />
            <Route path="/partner/delivery/:orderId" element={<ActiveDelivery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
