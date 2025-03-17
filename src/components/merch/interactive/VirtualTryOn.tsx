import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RefreshCw, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VirtualTryOnProps {
  productImage: string;
  isOpen: boolean;
  onClose: () => void;
}

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ productImage, isOpen, onClose }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Draw video frame
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw product overlay with some transparency
        const img = new Image();
        img.onload = () => {
          context.globalAlpha = 0.85;
          context.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          context.globalAlpha = 1.0;
          
          // Save the result
          const resultUrl = canvasRef.current!.toDataURL('image/png');
          setResult(resultUrl);
          stopCamera();
        };
        img.src = productImage;
      }
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result;
      link.download = 'virtual-try-on.png';
      link.click();
      toast.success('Image downloaded successfully!');
    }
  };

  const handleRetry = () => {
    setResult(null);
    startCamera();
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Virtual Try-On</h2>

        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
          {isCapturing && !result && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full object-cover mirror"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-lg border-2 border-dashed border-white/50 p-4">
                  <p className="text-center text-white">Position yourself in the frame</p>
                </div>
              </div>
            </>
          )}
          {result && (
            <img src={result} alt="Try-on result" className="h-full w-full object-contain" />
          )}
          <canvas ref={canvasRef} className="hidden" width={640} height={480} />
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {isCapturing && !result && (
            <button
              onClick={captureFrame}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              <Camera size={20} />
              <span>Capture</span>
            </button>
          )}
          {result && (
            <>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
              >
                <RefreshCw size={20} />
                <span>Try Again</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                <Download size={20} />
                <span>Download</span>
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          * This is a virtual preview. Actual product appearance may vary.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default VirtualTryOn; 