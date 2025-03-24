export type SortOption = 'created_at_desc' | 'price_asc' | 'price_desc' | 'relevance';

export interface Filters {
  categories: string[];
  subcategories: string[];
  conditions: string[];
  minPrice?: number;
  maxPrice?: number;
  search: string;
  sortBy: SortOption;
  showWishlisted: boolean;
  totalCount?: number;
}

export interface SearchParams {
  categories?: string[];
  subcategories?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
  viewAll?: boolean;
}

export const VALID_SORT_VALUES: SortOption[] = ['created_at_desc', 'price_asc', 'price_desc', 'relevance'];

export const isValidSortBy = (value: string): value is SortOption => {
  return VALID_SORT_VALUES.includes(value as SortOption);
};

export const getSortBy = (value: string | null): SortOption => {
  if (!value || !isValidSortBy(value)) {
    return 'created_at_desc';
  }
  return value;
}; 