import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, MapPin, ChevronRight } from "lucide-react";

const slides = [
  {
    icon: ShoppingBag,
    title: "Fresh Groceries",
    description: "Browse thousands of products from local stores near you",
    color: "text-primary"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your groceries delivered in under 30 minutes",
    color: "text-accent"
  },
  {
    icon: MapPin,
    title: "Hyper Local",
    description: "Support local stores while enjoying ultra-fast delivery",
    color: "text-primary"
  }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/location");
    }
  };

  const handleSkip = () => {
    navigate("/location");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle p-6">
      <div className="flex justify-end mb-8">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className={`mb-8 ${slide.color}`}>
          <Icon className="w-32 h-32" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {slide.title}
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-md mb-12">
          {slide.description}
        </p>

        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-primary" 
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <Button 
        onClick={handleNext}
        size="lg"
        className="w-full btn-touch gradient-primary hover:opacity-90"
      >
        {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        <ChevronRight className="ml-2" />
      </Button>
    </div>
  );
};

export default Onboarding;
