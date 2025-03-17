const CATEGORY_IMAGES: { [key: string]: string } = {
  'tshirt': '/assets/products/tshirt-default.jpg',
  'hoodie': '/assets/products/hoodie-default.jpg',
  'cap': '/assets/products/cap-default.jpg',
  'bag': '/assets/products/bag-default.jpg',
  'stationery': '/assets/products/stationery-default.jpg',
  'electronics': '/assets/products/electronics-default.jpg',
  'accessory': '/assets/products/accessory-default.jpg',
  'default': '/assets/products/product-default.jpg'
};

export const getPlaceholderImage = (title: string, category: string) => {
  // First try to match by category
  const key = category?.toLowerCase() || '';
  if (CATEGORY_IMAGES[key]) {
    return CATEGORY_IMAGES[key];
  }
  
  // If no category match, try to match by title
  const matchByTitle = Object.keys(CATEGORY_IMAGES).find(cat => 
    title.toLowerCase().includes(cat)
  );
  
  return CATEGORY_IMAGES[matchByTitle || 'default'];
};

export const PLACEHOLDER_IMAGE = '/assets/products/product-default.jpg'; 