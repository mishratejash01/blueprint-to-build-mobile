import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductImageProps {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
}

export const ProductImage = ({ 
  src, 
  alt, 
  fallback = "🛒", 
  className = "" 
}: ProductImageProps) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-4xl">{fallback}</span>
      </div>
    );
  }

  return (
    <>
      {loading && <Skeleton className={className} />}
      <img 
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : 'block'}`}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => setLoading(false)}
      />
    </>
  );
};
