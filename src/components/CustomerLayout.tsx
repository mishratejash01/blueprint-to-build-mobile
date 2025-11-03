import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, Home as HomeIcon, LayoutGrid } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/**
 * Helper function to determine active tab classes
 */
const getActiveClasses = (
  path: string,
  currentPath: string,
  isExact: boolean = false
) => {
  const isActive = isExact
    ? currentPath === path
    : currentPath.startsWith(path);
  
  return {
    div: isActive
      ? "bg-gradient-primary p-2.5 rounded-xl shadow-elegant"
      : "p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:shadow-elegant transition-all",
    icon: isActive
      ? "h-5 w-5 text-white"
      : "h-5 w-5 text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors",
    span: isActive
      ? "text-[10px] font-bold text-primary"
      : "text-[10px] font-semibold text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors",
  };
};

const CustomerLayout = () => {
  const { itemCount } = useCart();
  const location = useLocation();
  const pathname = location.pathname;

  // Determine active state for tabs
  const homeClasses = getActiveClasses("/home", pathname, true);
  const searchClasses = getActiveClasses("/search", pathname);
  // This "Categories" link points to /home, as in your original file.
  const categoriesClasses = getActiveClasses(
    "/categories-placeholder",
    pathname
  );
  const cartClasses = getActiveClasses("/cart", pathname);
  // Highlight "Profile" tab for profile, orders, and addresses pages
  const isProfileSection =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/addresses");
  const profileClasses = isProfileSection
    ? getActiveClasses("/profile", "/profile") // Force active state
    : getActiveClasses("/profile", pathname);

  return (
    // This div provides the main padding for all child pages
    <div className="min-h-screen bg-[hsl(var(--muted))] pb-20">
      {/* This Outlet renders the active child page (Home, Profile, etc.) */}
      <Outlet />

      {/* Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border shadow-premium z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          <Link
            to="/home"
            className="flex flex-col items-center gap-1 min-w-[70px] py-1 group"
          >
            <div className={homeClasses.div}>
              <HomeIcon className={homeClasses.icon} />
            </div>
            <span className={homeClasses.span}>Home</span>
          </Link>

          <Link
            to="/search"
            className="flex flex-col items-center gap-1 min-w-[70px] py-1 group"
          >
            <div className={searchClasses.div}>
              <Search className={searchClasses.icon} />
            </div>
            <span className={searchClasses.span}>Search</span>
          </Link>

          <Link
            to="/home"
            className="flex flex-col items-center gap-1 min-w-[70px] py-1 group"
          >
            <div className={categoriesClasses.div}>
              <LayoutGrid className={categoriesClasses.icon} />
            </div>
            <span className={categoriesClasses.span}>Categories</span>
          </Link>

          <Link
            to="/cart"
            className="flex flex-col items-center gap-1 min-w-[70px] py-1 group relative"
          >
            <div className={cartClasses.div}>
              <ShoppingCart className={cartClasses.icon} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-glow ring-2 ring-white animate-scale-in">
                  {itemCount}
                </span>
              )}
            </div>
            <span className={cartClasses.span}>Cart</span>
          </Link>

          <Link
            to="/profile"
            className="flex flex-col items-center gap-1 min-w-[70px] py-1 group"
          >
            <div className={profileClasses.div}>
              <User className={profileClasses.icon} />
            </div>
            <span className={profileClasses.span}>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CustomerLayout;
