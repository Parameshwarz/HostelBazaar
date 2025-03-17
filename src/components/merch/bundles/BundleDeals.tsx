import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Product } from '../../../types/merch';
import { toast } from 'react-hot-toast';

interface BundleDealsProps {
  products: Product[];
  onClose: () => void;
}

interface Bundle {
  products: Product[];
  discount: number;
}

const BundleDeals: React.FC<BundleDealsProps> = ({ products, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [suggestedBundles] = useState<Bundle[]>([
    {
      products: products.slice(0, 3),
      discount: 15
    },
    {
      products: products.slice(3, 6),
      discount: 20
    }
  ]);

  const calculateBundlePrice = (bundle: Bundle) => {
    const totalPrice = bundle.products.reduce((sum, product) => sum + (product.price || 0), 0);
    const discountAmount = (totalPrice * bundle.discount) / 100;
    return totalPrice - discountAmount;
  };

  const handleAddToBundle = (product: Product) => {
    if (selectedProducts.length >= 5) {
      toast.error('Maximum 5 products allowed in a bundle');
      return;
    }
    setSelectedProducts([...selectedProducts, product]);
  };

  const handleRemoveFromBundle = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleCreateBundle = () => {
    if (selectedProducts.length < 2) {
      toast.error('Please select at least 2 products for a bundle');
      return;
    }
    // Here you would typically send the bundle to your backend
    toast.success('Bundle created successfully!');
    setSelectedProducts([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold">Bundle Deals</h2>

        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold">Suggested Bundles</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {suggestedBundles.map((bundle, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">Bundle {index + 1}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    {bundle.discount}% OFF
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {bundle.products.map((product) => (
                    <div key={product.id} className="relative aspect-square overflow-hidden rounded">
                      <img
                        src={product.product_images?.[0]?.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Bundle Price:</span>
                    <span className="ml-2 text-lg font-bold">
                      ${calculateBundlePrice(bundle).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      toast.success('Bundle added to cart!');
                    }}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Add Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold">Create Your Own Bundle</h3>
          <div className="mb-4 grid grid-cols-5 gap-2">
            {selectedProducts.map((product) => (
              <div key={product.id} className="relative aspect-square overflow-hidden rounded border">
                <img
                  src={product.product_images?.[0]?.image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleRemoveFromBundle(product.id)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <Minus size={12} />
                </button>
              </div>
            ))}
            {Array.from({ length: 5 - selectedProducts.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded border-2 border-dashed border-gray-300"
              />
            ))}
          </div>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter((p) => !selectedProducts.find((sp) => sp.id === p.id))
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded border p-2"
                >
                  <img
                    src={product.product_images?.[0]?.image_url}
                    alt={product.title}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="flex-grow">
                    <h4 className="font-medium">{product.title}</h4>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                  <button
                    onClick={() => handleAddToBundle(product)}
                    className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateBundle}
              disabled={selectedProducts.length < 2}
              className="flex items-center gap-2 rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Package size={20} />
              <span>Create Bundle</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BundleDeals; 