export const CONDITIONS = ['New', 'Like New', 'Used', 'Damaged'] as const;

export const CATEGORIES = [
  'Books and Stationery',
  'Electronics',
  'Furniture',
  'Clothing',
  'Kitchen',
  'Appliances',
  'Sports',
  'Other'
] as const;

export const CATEGORY_SLUGS = {
  'Books and Stationary': 'books-and-stationary',
  'Electronics': 'electronics',
  'Furniture': 'furniture',
  'Clothing': 'clothing',
  'Kitchen': 'kitchen',
  'Sports': 'sports',
  'Other': 'other'
} as const;

export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  RECENT: 'created_at_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
} as const;

export const CATEGORY_KEYWORDS = {
  'books-and-stationery': [
    'book', 'textbook', 'novel', 'study', 'course', 'notes',
    'guide', 'material', 'literature', 'stationery', 'pen',
    'pencil', 'notebook', 'paper', 'academic', 'fiction',
    'non-fiction', 'study materials'
  ],
  'electronics': [
    'mobile', 'phone', 'laptop', 'computer', 'tablet', 'charger', 
    'headphone', 'earphone', 'speaker', 'keyboard', 'mouse'
  ],
  'appliances': [
    'refrigerator', 'fridge', 'washing machine', 'microwave',
    'air conditioner', 'ac', 'fan', 'cooler', 'heater', 'iron',
    'vacuum cleaner', 'mixer', 'grinder', 'kettle'
  ],
  'furniture': [
    'chair', 'table', 'desk', 'bed', 'furniture', 'shelf',
    'rack', 'storage', 'cupboard', 'almirah'
  ],
  'other': [
    'misc', 'miscellaneous', 'general', 'various', 'other',
    'random', 'assorted', 'mixed', 'diverse'
  ]
} as const;

export const SUBCATEGORIES = {
  'books-and-stationery': [
    { name: 'Academic', slug: 'academic' },
    { name: 'Fiction', slug: 'fiction' },
    { name: 'Non-Fiction', slug: 'non-fiction' },
    { name: 'Study Materials', slug: 'study-materials' },
    { name: 'Textbooks', slug: 'textbooks' },
    { name: 'Stationery', slug: 'stationery' }
  ],
  'other': [
    { name: 'Miscellaneous', slug: 'miscellaneous' },
    { name: 'General', slug: 'general' },
    { name: 'Various', slug: 'various' }
  ]
} as const;