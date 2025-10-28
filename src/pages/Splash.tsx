import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <Leaf className="w-24 h-24 text-white relative z-10" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">Veggieit</h1>
          <p className="text-white/90 text-lg">Fresh groceries, delivered fast</p>
        </div>
      </div>
    </div>
  );
};

export default Splash;
