import { motion } from 'framer-motion';
import { Collection } from '../types/merch';

export default function BrowseMerch() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {collections.map((collection) => (
          <motion.div
            key={collection.id}
            whileHover={{ y: -5 }}
            className="relative rounded-2xl overflow-hidden h-[300px] group"
            style={{ backgroundColor: collection.theme.bgColor }}
          >
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-4">
              {collection.products.slice(0, 4).map((product) => (
                <div key={product.id} className="relative overflow-hidden rounded-lg">
                  <Image
                    src={product.product_images?.[0]?.image_url ?? '/placeholder.png'}
                    alt={product.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-2xl font-bold" style={{ color: collection.theme.textColor }}>
                  {collection.name}
                </h3>
                <p className="text-sm mt-2" style={{ color: collection.theme.accentColor }}>
                  {collection.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Category Bubbles */}
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 
            text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Product Grid with Animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Keep existing MerchCard components */}
      </div>
    </div>
  );
} 