interface FilterOptions {
  price: {
    min: number;
    max: number;
  };
  colors: string[];
  sizes: string[];
  categories: string[];
  rating: number | null;
  sortBy: 'popularity' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'trending' | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  department: string[];
  tags: string[];
  onSale: boolean;
  newArrivals: boolean;
}

export type CampusCollection = 
  | 'Campus Essentials'
  | 'Premium Collection'
  | 'Winter Wear'
  | 'Limited Edition'
  | 'Eco-Friendly'
  | 'Accessories'
  | 'Sports & Athletics'
  | 'Graduation Collection';

export const getFiltersForCollection = (collection: CampusCollection): Partial<FilterOptions> => {
  switch (collection) {
    case 'Campus Essentials':
      return {
        categories: ['t-shirts', 'caps', 'hoodies', 'basics'],
        sortBy: 'popularity',
        price: { min: 0, max: 2000 } // Affordable range for essentials
      };

    case 'Premium Collection':
      return {
        tags: ['Premium'],
        price: { min: 2000, max: 100000 },
        sortBy: 'price_high'
      };

    case 'Winter Wear':
      return {
        categories: ['hoodies', 'sweatshirts', 'jackets'],
        tags: ['Winter'],
        sortBy: 'popularity'
      };

    case 'Limited Edition':
      return {
        tags: ['Limited Edition'],
        sortBy: 'newest'
      };

    case 'Eco-Friendly':
      return {
        tags: ['Eco-Friendly'],
        sortBy: 'popularity'
      };

    case 'Accessories':
      return {
        categories: ['accessories', 'bags', 'stationery', 'drinkware'],
        sortBy: 'popularity'
      };

    case 'Sports & Athletics':
      return {
        department: ['Sports'],
        categories: ['sportswear', 't-shirts', 'shorts', 'socks'],
        tags: ['Sports']
      };

    case 'Graduation Collection':
      return {
        tags: ['Graduation'],
        categories: ['gifts', 'accessories'],
        sortBy: 'popularity'
      };

    default:
      return {};
  }
}; 