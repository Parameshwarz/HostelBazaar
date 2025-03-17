import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/merch';

interface FeaturedProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

export default function FeaturedProducts({ products, onProductClick }: FeaturedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  console.log('FeaturedProducts - All products:', products);

  const featuredProducts = products.slice(0, 5);
  console.log('FeaturedProducts - Sliced products:', featuredProducts);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + featuredProducts.length) % featuredProducts.length);
  };

  if (featuredProducts.length === 0) {
    console.log('FeaturedProducts - No products available');
    return null;
  }

  const currentProduct = featuredProducts[currentIndex];
  console.log('FeaturedProducts - Current product:', currentProduct);
  const primaryImage = currentProduct.product_images?.find(img => img.is_primary)?.image_url;
  console.log('FeaturedProducts - Primary image:', primaryImage);

  return (
    <div className="relative bg-gradient-to-br from-violet-100 to-indigo-50 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Featured Products
        </h2>

        <div className="relative h-[500px] w-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Product Image */}
                <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center p-8"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={currentProduct.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Image load error:', e);
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-4xl text-violet-400">?</span>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {currentProduct.title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                  >
                    {currentProduct.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-3xl font-bold text-violet-600">
                      ₹{currentProduct.price}
                    </span>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-8 py-3 bg-violet-600 text-white rounded-lg text-lg font-medium
                      hover:bg-violet-700 transition-colors"
                    onClick={() => onProductClick(currentProduct.id)}
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 
              shadow-lg backdrop-blur-sm hover:bg-white transition-colors z-10"
            onClick={() => paginate(-1)}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 
              shadow-lg backdrop-blur-sm hover:bg-white transition-colors z-10"
            onClick={() => paginate(1)}
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
} 