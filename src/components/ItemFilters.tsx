import React from 'react';
import { Sliders } from 'lucide-react';

interface ItemFiltersProps {
  onFilterChange: (filters: {
    condition?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => void;
}

export default function ItemFilters({ onFilterChange }: ItemFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <Sliders className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="created_at_desc">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <div className="space-y-2">
            {['New', 'Like New', 'Used', 'Damaged'].map((condition) => (
              <label key={condition} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  onChange={(e) => {
                    onFilterChange({
                      condition: e.target.checked ? [condition] : [],
                    });
                  }}
                />
                <span className="ml-2 text-sm text-gray-600">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) =>
                onFilterChange({ minPrice: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) =>
                onFilterChange({ maxPrice: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}