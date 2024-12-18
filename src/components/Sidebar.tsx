import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

export default function Sidebar() {
  const navigate = useNavigate();
  const { categories, isLoading } = useCategories();

  return (
    <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:block">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <nav className="space-y-1">
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/?category=${category.name}`)}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
              >
                <Tag className="h-4 w-4 mr-2" />
                <span>{category.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {category.item_count}
                </span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}