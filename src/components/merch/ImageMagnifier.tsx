import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnification?: number;
  className?: string;
  lensSize?: number;
}

export default function ImageMagnifier({ 
  src, 
  alt, 
  magnification = 2, 
  className = '',
  lensSize = 150
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.pageX - rect.left) / rect.width) * 100;
    const y = ((e.pageY - rect.top) / rect.height) * 100;

    // Ensure the lens doesn't go out of bounds
    const halfLensSize = lensSize / 2;
    const boundedX = Math.min(Math.max(x, halfLensSize / rect.width * 100), 100 - halfLensSize / rect.width * 100);
    const boundedY = Math.min(Math.max(y, halfLensSize / rect.height * 100), 100 - halfLensSize / rect.height * 100);

    setMagnifierPosition({ x: boundedX, y: boundedY });
  };

  const handleError = () => {
    console.log('Image load error:', src);
    setIsError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (isError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <ShoppingBag className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div 
      ref={imageRef}
      className="relative w-full h-full group cursor-zoom-in"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Main Image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
      />
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Magnifier Lens */}
      <AnimatePresence>
        {showMagnifier && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute pointer-events-none z-10"
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `calc(${magnifierPosition.x}% - ${lensSize / 2}px)`,
              top: `calc(${magnifierPosition.y}% - ${lensSize / 2}px)`,
            }}
          >
            {/* Lens Border */}
            <div className="absolute inset-0 rounded-full border-2 border-violet-600/30 backdrop-blur-sm" />
            
            {/* Magnified Image */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                backgroundImage: `url(${src})`,
                backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                backgroundSize: `${magnification * 100}%`,
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 