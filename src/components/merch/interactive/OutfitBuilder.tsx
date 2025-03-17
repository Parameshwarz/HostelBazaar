import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Layers, Save, Share2, Trash2, Plus } from 'lucide-react';
import { Product } from '../../../types/merch';

interface OutfitBuilderProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSaveOutfit: (outfit: Product[]) => void;
}

interface Outfit {
  id: string;
  products: Product[];
  totalPrice: number;
}

export default function OutfitBuilder({ products, isOpen, onClose, onSaveOutfit }: OutfitBuilderProps) {
  const [currentOutfit, setCurrentOutfit] = useState<Product[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const addToOutfit = (product: Product) => {
    setCurrentOutfit(prev => [...prev, product]);
  };

  const removeFromOutfit = (productId: string) => {
    setCurrentOutfit(prev => prev.filter(p => p.id !== productId));
  };

  const saveOutfit = () => {
    if (currentOutfit.length === 0) return;

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      products: [...currentOutfit],
      totalPrice: currentOutfit.reduce((sum, p) => sum + p.price, 0)
    };

    setSavedOutfits(prev => [...prev, newOutfit]);
    onSaveOutfit(currentOutfit);
    setCurrentOutfit([]);
  };

  const shareOutfit = async (outfit: Outfit) => {
    try {
      await navigator.share({
        title: 'Check out my outfit from College Merch Store!',
        text: `Total Price: ₹${outfit.totalPrice}`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing outfit:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-6xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <motion.div whileHover={{ rotate: 90 }}>
                  <Plus className="w-6 h-6 rotate-45" />
                </motion.div>
              </button>
            </div>

            <div className="grid grid-cols-12 h-full">
              {/* Products Panel */}
              <div className="col-span-3 border-r h-full overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold mb-4">Products</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid gap-4">
                    {filteredProducts.map(product => (
                      <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg shadow p-2 cursor-pointer"
                        onClick={() => addToOutfit(product)}
                      >
                        <div className="aspect-square rounded-md overflow-hidden mb-2">
                          <img
                            src={product.product_images?.[0]?.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-medium">{product.title}</h4>
                        <p className="text-sm text-violet-600">₹{product.price}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Outfit */}
              <div className="col-span-6 h-full flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Current Outfit</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentOutfit([])}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={saveOutfit}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700
                        transition-colors flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Outfit
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                  <Reorder.Group
                    axis="y"
                    values={currentOutfit}
                    onReorder={setCurrentOutfit}
                    className="space-y-4"
                  >
                    {currentOutfit.map(product => (
                      <Reorder.Item
                        key={product.id}
                        value={product}
                        className="bg-white rounded-lg shadow-sm p-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={product.product_images?.[0]?.image_url}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{product.title}</h4>
                            <p className="text-violet-600">₹{product.price}</p>
                          </div>
                          <button
                            onClick={() => removeFromOutfit(product.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                  {currentOutfit.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Layers className="w-12 h-12 mb-2" />
                      <p>Add products to create an outfit</p>
                    </div>
                  )}
                </div>
                {currentOutfit.length > 0 && (
                  <div className="p-4 border-t bg-white">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold text-violet-600">
                        ₹{currentOutfit.reduce((sum, p) => sum + p.price, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Outfits */}
              <div className="col-span-3 border-l h-full overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Saved Outfits</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {savedOutfits.map(outfit => (
                      <div
                        key={outfit.id}
                        className="bg-white rounded-lg shadow-sm p-4"
                      >
                        <div className="flex flex-wrap gap-2 mb-4">
                          {outfit.products.map(product => (
                            <img
                              key={product.id}
                              src={product.product_images?.[0]?.image_url}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-violet-600">
                            ₹{outfit.totalPrice}
                          </span>
                          <button
                            onClick={() => shareOutfit(outfit)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Share2 className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 