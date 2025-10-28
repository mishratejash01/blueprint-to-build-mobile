import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartAnimationProps {
  show: boolean;
  productImage: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

const AddToCartAnimation = ({
  show,
  productImage,
  startPosition,
  endPosition,
  onComplete
}: AddToCartAnimationProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            position: "fixed",
            left: startPosition.x,
            top: startPosition.y,
            scale: 1,
            opacity: 1,
            zIndex: 9999
          }}
          animate={{
            left: endPosition.x,
            top: endPosition.y,
            scale: 0.3,
            opacity: 0.8
          }}
          exit={{
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          onAnimationComplete={() => {
            setIsVisible(false);
            onComplete();
          }}
          className="pointer-events-none"
        >
          <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-3xl">
            {productImage}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartAnimation;
