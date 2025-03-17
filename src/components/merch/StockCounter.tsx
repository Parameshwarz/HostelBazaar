import React from 'react';

interface StockCounterProps {
  stockCount: number;
}

export default function StockCounter({ stockCount }: StockCounterProps) {
  const getStockStatus = () => {
    if (stockCount > 10) return { text: 'In Stock', color: 'bg-green-500' };
    if (stockCount > 5) return { text: 'Limited Stock', color: 'bg-yellow-500' };
    if (stockCount > 0) return { text: 'Low Stock', color: 'bg-red-500' };
    return { text: 'Out of Stock', color: 'bg-gray-500' };
  };

  const { text, color } = getStockStatus();

  return (
    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm font-medium text-gray-700">
          {text}
        </span>
      </div>
    </div>
  );
} 