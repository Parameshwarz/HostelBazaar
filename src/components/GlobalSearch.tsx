import React, { useState, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Update category suggestions
  const categorySuggestions = [
    { name: 'Books and Stationery', slug: 'books-and-stationery' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Kitchen', slug: 'kitchen' },
    { name: 'Appliances', slug: 'appliances' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Other', slug: 'other' }
  ];

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search items..."
          className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg 
            focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 
            bg-indigo-600 text-white text-sm font-medium rounded-md 
            hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          Search
        </button>
      </div>
    </div>
  );
} 