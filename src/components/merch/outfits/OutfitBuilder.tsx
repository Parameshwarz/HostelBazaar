import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shirt,
  CircleOff,
  Footprints,
  Heart,
  Share2,
  Download,
  Plus,
  Trash2,
  ShoppingCart,
  Save,
} from 'lucide-react';
import { Product } from '../../../types/merch';

interface OutfitBuilderProps {
  products: Product[];
  onAddToCart: (products: Product[]) => void;
  onClose: () => void;
}

interface Outfit {
  id: string;
  name: string;
  items: Product[];
  totalPrice: number;
}

export default function OutfitBuilder({ products, onAddToCart, onClose }: OutfitBuilderProps) {
  const [currentOutfit, setCurrentOutfit] = useState<Product[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [activeCategory, setActiveCategory] = useState<'tops' | 'bottoms' | 'shoes'>('tops');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const categories = {
    tops: products.filter(p => p.category === 'tops'),
    bottoms: products.filter(p => p.category === 'bottoms'),
    shoes: products.filter(p => p.category === 'shoes'),
  };

  const calculateTotalPrice = (items: Product[]) => {
    return items.reduce((total, item) => total + (item.discount_price || item.price), 0);
  };

  const handleAddToOutfit = (product: Product) => {
    // Replace existing product in the same category
    const updatedOutfit = currentOutfit.filter(item => item.category !== product.category);
    setCurrentOutfit([...updatedOutfit, product]);
  };

  const handleRemoveFromOutfit = (product: Product) => {
    setCurrentOutfit(currentOutfit.filter(item => item.id !== product.id));
  };

  const handleSaveOutfit = () => {
    if (!outfitName.trim() || currentOutfit.length === 0) return;

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      name: outfitName,
      items: [...currentOutfit],
      totalPrice: calculateTotalPrice(currentOutfit),
    };

    setSavedOutfits([...savedOutfits, newOutfit]);
    setOutfitName('');
    setShowSaveDialog(false);
  };

  const handleLoadOutfit = (outfit: Outfit) => {
    setCurrentOutfit(outfit.items);
  };

  const handleDeleteOutfit = (outfitId: string) => {
    setSavedOutfits(savedOutfits.filter(outfit => outfit.id !== outfitId));
  };

  const handleAddOutfitToCart = () => {
    onAddToCart(currentOutfit);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Shirt className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Outfit Builder</h3>
              <p className="text-gray-600">Mix and match to create your perfect look</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="col-span-2 space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory('tops')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeCategory === 'tops'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <Shirt className="w-4 h-4" />
                Tops
              </button>
              <button
                onClick={() => setActiveCategory('bottoms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeCategory === 'bottoms'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <CircleOff className="w-4 h-4" />
                Bottoms
              </button>
              <button
                onClick={() => setActiveCategory('shoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  ${activeCategory === 'shoes'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <Footprints className="w-4 h-4" />
                Shoes
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories[activeCategory].map((product) => (
                <motion.div
                  key={product.id}
                  layoutId={product.id}
                  className="relative rounded-lg border-2 overflow-hidden cursor-pointer
                    hover:border-emerald-500 transition-colors"
                  onClick={() => handleAddToOutfit(product)}
                >
                  <div className="aspect-square bg-gray-100">
                    {product.product_images?.[0]?.image_url ? (
                      <img
                        src={product.product_images[0].image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1">{product.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-600">
                        ₹{product.discount_price || product.price}
                      </span>
                      {product.discount_price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Outfit */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-4">Current Outfit</h4>
              <div className="space-y-4">
                {currentOutfit.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    className="flex items-center gap-3 bg-white rounded-lg p-2"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product_images?.[0]?.image_url && (
                        <img
                          src={item.product_images[0].image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">{item.title}</h5>
                      <p className="text-sm text-emerald-600">
                        ₹{item.discount_price || item.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromOutfit(item)}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </motion.div>
                ))}

                {currentOutfit.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Add items to create your outfit
                  </p>
                )}

                {currentOutfit.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold">
                          ₹{calculateTotalPrice(currentOutfit)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSaveDialog(true)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200
                            transition-colors"
                        >
                          <Save className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={handleAddOutfitToCart}
                          className="p-2 bg-emerald-600 text-white rounded-lg
                            hover:bg-emerald-700 transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Outfits */}
            <div>
              <h4 className="font-medium mb-4">Saved Outfits</h4>
              <div className="space-y-4">
                {savedOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">{outfit.name}</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadOutfit(outfit)}
                          className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteOutfit(outfit.id)}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {outfit.items.map((item) => (
                        <div
                          key={item.id}
                          className="w-12 h-12 bg-white rounded-lg overflow-hidden"
                        >
                          {item.product_images?.[0]?.image_url && (
                            <img
                              src={item.product_images[0].image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      ₹{outfit.totalPrice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Outfit Dialog */}
        <AnimatePresence>
          {showSaveDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowSaveDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                <h4 className="text-lg font-semibold mb-4">Save Outfit</h4>
                <input
                  type="text"
                  value={outfitName}
                  onChange={e => setOutfitName(e.target.value)}
                  placeholder="Enter outfit name"
                  className="w-full px-4 py-2 border rounded-lg mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOutfit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg
                      hover:bg-emerald-700"
                  >
                    Save Outfit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 