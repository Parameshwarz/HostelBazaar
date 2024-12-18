export const CONDITIONS = ['New', 'Like New', 'Used', 'Damaged'] as const;

export const CATEGORIES = [
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Kitchen',
  'Sports',
  'Other',
] as const;

export const SORT_OPTIONS = {
  RECENT: 'created_at_desc',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
} as const;