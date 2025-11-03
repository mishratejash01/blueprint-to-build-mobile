import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";

// Import the new layout
import CustomerLayout from "./components/CustomerLayout";

// Import Pages
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Location from "./pages/Location";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import Category from "./pages/Category";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import StoreDashboard from "./pages/store/StoreDashboard";
import StoreInventory from "./pages/store/StoreInventory";
import StoreOrders from "./pages/store/StoreOrders";
import StoreAnalytics from "./pages/store/StoreAnalytics";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrders from "./pages/partner/PartnerOrders";
import PartnerEarnings from "./pages/partner/PartnerEarnings";
import PartnerProfile from "./pages/partner/PartnerProfile";
import ActiveDelivery from "./pages/partner/ActiveDelivery";
import PickupVerify from "./pages/partner/PickupVerify";
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
            {/* Standalone routes (no nav bar) */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/location" element={<Location />} />
            <Route path="/auth" element={<Auth />} />

            {/* Customer routes WITH the persistent bottom nav bar */}
            <Route element={<CustomerLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/category/:categoryId" element={<Category />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addresses" element={<Addresses />} />
            </Route>

            {/* Customer routes WITHOUT the nav bar (full-screen) */}
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmation />}
            />
            <Route path="/track/:orderId" element={<OrderTracking />} />

            {/* Store routes */}
            <Route path="/store/dashboard" element={<StoreDashboard />} />
            <Route path="/store/inventory" element={<StoreInventory />} />
            <Route path="/store/orders" element={<StoreOrders />} />
            <Route path="/store/analytics" element={<StoreAnalytics />} />

            {/* Partner routes */}
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/partner/orders" element={<PartnerOrders />} />
            <Route
              path="/partner/pickup-verify/:orderId"
              element={<PickupVerify />}
            />
            <Route path="/partner/earnings" element={<PartnerEarnings />} />
            <Route path="/partner/profile" element={<PartnerProfile />} />
            <Route
              path="/partner/delivery/:orderId"
              element={<ActiveDelivery />}
            />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
