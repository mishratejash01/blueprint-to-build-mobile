import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

// Import a Google icon (you might need to install a library like react-icons)
// Example using lucide-react (if it has one, otherwise find another source)
// Let's assume you have a Google icon component or SVG

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // New state for Google loading
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer";

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Simplified auth state management with retry logic - prevent race conditions
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted || !session) return;
        
        console.log("✅ Session found, fetching profile...");
        setIsRedirecting(true);
        
        // Fetch profile with retry logic
        let profile = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!profile && attempts < maxAttempts && mounted) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (data) {
            profile = data;
            console.log("✅ Profile fetched:", profile.role);
          } else {
            console.warn(`⚠️ Profile fetch attempt ${attempts + 1} failed:`, error);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!mounted) return;
        
        // Determine redirect path
        let path = "/home";
        
        if (profile?.role === "store_manager") {
          path = "/store/dashboard";
        } else if (profile?.role === "partner") {
          path = "/partner/dashboard";
        }
        
        console.log(`🚀 Redirecting to: ${path}`);
        window.location.href = path;
        
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (mounted) {
          setIsRedirecting(false);
        }
      }
    };
    
    // Set timeout to force redirect if stuck (max 5 seconds)
    timeoutId = setTimeout(() => {
      if (isRedirecting && mounted) {
        console.warn("⚠️ Redirect timeout - forcing navigation");
        window.location.href = "/home";
      }
    }, 5000);
    
    checkAuth();
    
    return () => { 
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency - only run once on mount


  // --- handleSignUp remains the same ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/auth?type=${userType}`;

    const role = userType === "store" ? "store_manager" : userType === "partner" ? "delivery_partner" : "customer";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          role: role
        }
      }
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email."
      });
    }
  };

  // --- handleSignIn remains the same ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // --- NEW: Handle Google Sign In ---
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const role = userType === "store" ? "store_manager" : userType === "partner" ? "delivery_partner" : "customer";
    const redirectUrl = `${window.location.origin}/auth?type=${userType}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
         queryParams: {
           // You can add additional query parameters if needed
           // access_type: 'offline',
           // prompt: 'consent',
         },
         // Pass role information if needed during the OAuth flow
         // (check Supabase docs if `data` is supported here, might need profile update post-login)
         // data: {
         //   role: role
         // }
      },
    });

    if (error) {
      setGoogleLoading(false);
      toast({
        title: "Error",
        description: `Google Sign In failed: ${error.message}`,
        variant: "destructive"
      });
    }
    // No need to set loading to false on success, as the page will redirect
  };


  const getTitle = () => {
    if (userType === "store") return "Store Manager";
    if (userType === "partner") return "Delivery Partner";
    return "Customer";
  };

  // Prevent rendering if redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Veggieit</h1>
          <p className="text-muted-foreground">{getTitle()} Login</p>
        </div>

        {/* --- NEW: Google Sign In Button --- */}
        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {/* Replace with your actual Google Icon component */}
          {/* <GoogleIcon className="mr-2 h-4 w-4" /> */}
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.4 0 129.5 27.5 173.4 68.9l-63.1 61.7c-25.1-23.6-58.4-38.1-96.6-38.1-83.3 0-151.8 68.1-151.8 151.8s68.5 151.8 151.8 151.8c97.1 0 131.2-66.8 136.9-101.8H244v-81.4h236.1c2.4 12.8 3.9 26.4 3.9 40.8z"></path></svg>
          {googleLoading ? "Redirecting..." : "Sign in with Google"}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        {/* --- End Google Sign In Button --- */}


        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* --- Email/Password Sign In Form remains the same --- */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
             <form onSubmit={handleSignUp} className="space-y-4">
               {/* --- Sign Up Form remains the same --- */}
               <div>
                 <Label htmlFor="fullName">Full Name</Label>
                 <Input
                   id="fullName"
                   type="text"
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="phone">Phone Number</Label>
                 <Input
                   id="phone"
                   type="tel"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="signupEmail">Email</Label>
                 <Input
                   id="signupEmail"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="signupPassword">Password</Label>
                 <Input
                   id="signupPassword"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   minLength={6}
                 />
               </div>
               <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? "Creating account..." : "Sign Up"}
               </Button>
             </form>
          </TabsContent>
        </Tabs>

        {userType === "customer" && (
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">Are you a:</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth?type=store")}
              >
                Store Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth?type=partner")}
              >
                Delivery Partner
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Auth;
