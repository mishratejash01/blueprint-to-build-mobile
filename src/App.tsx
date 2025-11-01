import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import ErrorBoundary from "./components/ErrorBoundary";
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
import Categories from "./pages/Categories";
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

// Configure React Query with optimized cache-busting settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed queries twice
      staleTime: 10000, // Data considered fresh for only 10 seconds
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: true, // CRITICAL: Refetch when user returns to tab
      refetchOnReconnect: true, // Refetch on reconnect
    },
    mutations: {
      retry: 1,
      onSuccess: () => {
        // Invalidate orders cache after any mutation
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
      onError: (error: any) => {
        console.error("Mutation error:", error);
        // Only show toast for critical errors
        if (error?.message && !error.message.includes("JWT")) {
          toast({
            title: "Action Failed",
            description: error.message || "Please try again",
            variant: "destructive"
          });
        }
      }
    }
  }
});

const App = () => (
  <ErrorBoundary>
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
              <Route path="/search" element={<Search />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:categoryId" element={<Category />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/track/:orderId" element={<OrderTracking />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/store/dashboard" element={<StoreDashboard />} />
              <Route path="/store/inventory" element={<StoreInventory />} />
              <Route path="/store/orders" element={<StoreOrders />} />
              <Route path="/store/analytics" element={<StoreAnalytics />} />
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route path="/partner/orders" element={<PartnerOrders />} />
              <Route path="/partner/pickup-verify/:orderId" element={<PickupVerify />} />
              <Route path="/partner/earnings" element={<PartnerEarnings />} />
              <Route path="/partner/profile" element={<PartnerProfile />} />
              <Route path="/partner/delivery/:orderId" element={<ActiveDelivery />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
