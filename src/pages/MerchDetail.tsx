import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Shield, 
  Truck, 
  Package, 
  ShoppingCart, 
  Heart,
  Share2,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Product } from '../types/merch';
import { useAuthStore } from '../store/authStore';

export default function MerchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*),
          product_reviews (*),
          product_variants (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      if (data?.product_images?.[0]) {
        setSelectedImage(data.product_images[0].image_url);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: id,
          variant_id: product?.product_variants?.find(
            v => v.size === selectedSize && v.color === selectedColor
          )?.id,
          quantity
        });

      if (error) throw error;
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const avgRating = product.product_reviews?.length
    ? product.product_reviews.reduce((acc, review) => acc + review.rating, 0) / product.product_reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span>Home</span>
          <ChevronRight className="w-4 h-4" />
          <span>College Merch</span>
          <ChevronRight className="w-4 h-4" />
          <span>{product.category}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:w-2/5">
            <div className="sticky top-20">
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedImage || product.product_images?.[0]?.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.product_images?.map((image) => (
                  <button
                    key={image.id}
                    className={`aspect-square rounded-lg overflow-hidden border-2 
                      ${selectedImage === image.image_url ? 'border-indigo-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(image.image_url)}
                  >
                    <img
                      src={image.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Product Details */}
          <div className="lg:w-2/5">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-indigo-600">
                  {product.product_reviews?.length} ratings
                </span>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.price > 499 && (
                  <span className="text-sm text-green-600">Free Delivery</span>
                )}
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">{product.description}</p>
              
              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Delivery to College Campus</span>
              </div>
              
              {/* Stock Status */}
              {product.stock_quantity > 0 ? (
                <div className="text-green-600 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>In Stock - Get it by Tomorrow</span>
                </div>
              ) : (
                <div className="text-red-600">Out of Stock</div>
              )}
            </div>

            {/* Variants Selection */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {/* Size Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from(new Set(product.product_variants.map(v => v.size))).map((size) => (
                      <button
                        key={size}
                        className={`px-4 py-2 border rounded-md text-sm
                          ${selectedSize === size 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from(new Set(product.product_variants.map(v => v.color))).map((color) => (
                      <button
                        key={color}
                        className={`px-4 py-2 border rounded-md text-sm
                          ${selectedColor === color 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Buy Box */}
          <div className="lg:w-1/5">
            <div className="sticky top-20 bg-white border rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 mb-4">
                ₹{product.price}
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border rounded-md py-2 px-3"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-2 px-4 rounded-lg mb-2 
                  flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              {/* Buy Now Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg mb-4"
              >
                Buy Now
              </button>

              {/* Secure Transaction */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Shield className="w-4 h-4" />
                <span>Secure transaction</span>
              </div>

              {/* Wishlist & Share */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          {product.product_reviews?.length ? (
            <div className="space-y-8">
              {product.product_reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
} 