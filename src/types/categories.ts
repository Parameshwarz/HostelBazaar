export const CATEGORIES = {
  'Books and Stationery': {
    name: 'Books and Stationery',
    subcategories: [
      { name: 'Textbooks', slug: 'textbooks' },
      { name: 'Academic', slug: 'academic' },
      { name: 'Fiction', slug: 'fiction' },
      { name: 'Non-Fiction', slug: 'non-fiction' },
      { name: 'Study Materials', slug: 'study-materials' },
      { name: 'Stationery', slug: 'stationery' }
    ]
  },
  'Electronics': {
    name: 'Electronics',
    subcategories: [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Phones', slug: 'phones' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Gaming', slug: 'gaming' },
      { name: 'Other Electronics', slug: 'other-electronics' }
    ]
  },
  'Furniture': {
    name: 'Furniture',
    subcategories: [
      { name: 'Beds & Mattresses', slug: 'beds-mattresses' },
      { name: 'Tables & Desks', slug: 'tables-desks' },
      { name: 'Chairs', slug: 'chairs' },
      { name: 'Storage', slug: 'storage' },
      { name: 'Other Furniture', slug: 'other-furniture' }
    ]
  },
  'Clothing': {
    name: 'Clothing',
    subcategories: [
      { name: 'Men\'s Wear', slug: 'mens-wear' },
      { name: 'Women\'s Wear', slug: 'womens-wear' },
      { name: 'Winter Wear', slug: 'winter-wear' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Accessories', slug: 'clothing-accessories' }
    ]
  },
  'Kitchen': {
    name: 'Kitchen',
    subcategories: [
      { name: 'Utensils', slug: 'utensils' },
      { name: 'Storage', slug: 'kitchen-storage' },
      { name: 'Dining', slug: 'dining' },
      { name: 'Other Kitchen', slug: 'other-kitchen' }
    ]
  },
  'Appliances': {
    name: 'Appliances',
    subcategories: [
      { name: 'Refrigerators', slug: 'refrigerators' },
      { name: 'Washing Machines', slug: 'washing-machines' },
      { name: 'Air Conditioners', slug: 'air-conditioners' },
      { name: 'Small Appliances', slug: 'small-appliances' },
      { name: 'Other Appliances', slug: 'other-appliances' }
    ]
  },
  'Sports': {
    name: 'Sports',
    subcategories: [
      { name: 'Equipment', slug: 'equipment' },
      { name: 'Clothing', slug: 'sports-clothing' },
      { name: 'Accessories', slug: 'sports-accessories' },
      { name: 'Footwear', slug: 'sports-footwear' },
      { name: 'Other Sports', slug: 'other-sports' }
    ]
  },
  'Other': {
    name: 'Other',
    subcategories: [
      { name: 'Art Supplies', slug: 'art-supplies' },
      { name: 'Room Decor', slug: 'room-decor' },
      { name: 'Miscellaneous', slug: 'miscellaneous' }
    ]
  }
} as const;

export type CategoryName = keyof typeof CATEGORIES;
export type Category = typeof CATEGORIES[CategoryName];
export type Subcategory = Category['subcategories'][number];

export type CategoryId = string;
export type SubcategoryId = string;

export interface DBCategory {
  id: CategoryId;
  name: string;
  slug: string;
  created_at: string;
}

export interface DBSubcategory {
  id: SubcategoryId;
  name: string;
  slug: string;
  category_id: CategoryId;
  created_at: string;
} 