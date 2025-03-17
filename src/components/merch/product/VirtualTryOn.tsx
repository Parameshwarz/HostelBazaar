import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RefreshCw,
  Camera as CameraIcon,
  Download,
  Share2,
  Maximize2,
  MinimizeIcon,
  AlertCircle,
} from 'lucide-react';
import { Product } from '../../../types/merch';

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
}

export default function VirtualTryOn({ product, onClose }: VirtualTryOnProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [overlayScale, setOverlayScale] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      setHasPermission(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const handleCapture = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    setIsCapturing(true);

    // Draw video frame
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Draw product overlay
    if (product.product_images?.[0]?.image_url) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(
          img,
          overlayPosition.x,
          overlayPosition.y,
          img.width * overlayScale,
          img.height * overlayScale
        );
        setCapturedImage(canvasRef.current?.toDataURL('image/png') || null);
        setIsCapturing(false);
      };
      img.src = product.product_images[0].image_url;
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `virtual-tryon-${product.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!capturedImage) return;

    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          title: `Virtual Try-On - ${product.title}`,
          text: 'Check out how this looks on me!',
          files: [file],
        });
      } else {
        setError('Sharing is not supported on this device');
      }
    } catch (err) {
      setError('Failed to share image');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setOverlayPosition({ x: 0, y: 0 });
    setOverlayScale(1);
  };

  const handleDrag = (e: React.DragEvent) => {
    setOverlayPosition({
      x: overlayPosition.x + e.movementX,
      y: overlayPosition.y + e.movementY,
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    setOverlayScale(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
  };

  return (
    <div className={`bg-black relative ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-xl'}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CameraIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Virtual Try-On</h3>
              <p className="text-gray-400">See how this item looks on you</p>
            </div>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <MinimizeIcon className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {hasPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-white text-center mb-4">{error}</p>
              <button
                onClick={requestCameraPermission}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg
                  hover:bg-purple-700 transition-colors"
              >
                Enable Camera
              </button>
            </div>
          )}

          {hasPermission === true && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
              />
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className={`w-full h-full ${capturedImage ? '' : 'hidden'}`}
              />
              {product.product_images?.[0]?.image_url && !capturedImage && (
                <motion.img
                  src={product.product_images[0].image_url}
                  alt={product.title}
                  className="absolute pointer-events-auto cursor-move"
                  style={{
                    x: overlayPosition.x,
                    y: overlayPosition.y,
                    scale: overlayScale,
                  }}
                  drag
                  onDrag={handleDrag}
                  whileDrag={{ opacity: 0.8 }}
                  onWheel={handleWheel}
                />
              )}
            </>
          )}
        </div>

        {isCameraReady && (
          <div className="flex items-center justify-center gap-4 mt-6">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700
                  transition-colors flex items-center justify-center"
              >
                <Camera className="w-6 h-6" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  className="p-4 bg-gray-600 text-white rounded-full hover:bg-gray-700
                    transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700
                    transition-colors flex items-center justify-center"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700
                    transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-medium text-white mb-2">Instructions</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Position yourself in frame and ensure good lighting</li>
            <li>• Drag the product overlay to position it correctly</li>
            <li>• Use mouse wheel or pinch to resize the product</li>
            <li>• Click the camera button to capture</li>
            <li>• Download or share your virtual try-on photo</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 