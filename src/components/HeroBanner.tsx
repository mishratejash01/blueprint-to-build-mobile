import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "Fresh Vegetables",
    subtitle: "Farm-fresh produce delivered in 30 minutes",
    color: "bg-gradient-to-r from-green-50 to-emerald-50",
    emoji: "🥬"
  },
  {
    id: 2,
    title: "Weekly Deals",
    subtitle: "Up to 40% off on fresh fruits",
    color: "bg-gradient-to-r from-orange-50 to-amber-50",
    emoji: "🍊"
  },
  {
    id: 3,
    title: "Daily Essentials",
    subtitle: "Milk, bread, and more at your doorstep",
    color: "bg-gradient-to-r from-blue-50 to-cyan-50",
    emoji: "🥛"
  }
];

const HeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative px-4 mb-6">
      <Card className="relative overflow-hidden rounded-2xl h-[180px] border-none shadow-card">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 ${banner.color} transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-between h-full px-8">
              <div className="space-y-2 flex-1">
                <h2 className="text-3xl font-bold text-[hsl(var(--text-primary))]">
                  {banner.title}
                </h2>
                <p className="text-base text-[hsl(var(--text-secondary))] font-medium">
                  {banner.subtitle}
                </p>
              </div>
              <div className="text-8xl opacity-20">
                {banner.emoji}
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-white/50 w-2"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HeroBanner;
