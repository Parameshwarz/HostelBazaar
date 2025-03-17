import { Tag, TrendingUp, Clock } from 'lucide-react';

interface ResultsSummaryProps {
  totalItems: number;
  newItemsCount: number;
  likeNewItemsCount: number;
  usedItemsCount: number;
  hasExactMatches: boolean;
  isSearching: boolean;
  searchQuery?: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  totalItems,
  newItemsCount,
  likeNewItemsCount,
  usedItemsCount,
  hasExactMatches,
  isSearching,
  searchQuery
}) => {
  if (totalItems === 0 || isSearching) return null;

  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2">
        {isSearching ? (
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {searchQuery ? (
                <>
                  {totalItems} {totalItems === 1 ? 'result' : 'results'} for "{searchQuery}"
                </>
              ) : (
                <>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} available
                </>
              )}
            </span>
            {!hasExactMatches && searchQuery && (
              <span className="text-sm text-gray-500">
                (including similar matches)
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      {totalItems > 0 && !isSearching && (
        <div className="flex items-center gap-4 text-sm">
          {newItemsCount > 0 && (
            <span className="text-emerald-600">
              {newItemsCount} New
            </span>
          )}
          {likeNewItemsCount > 0 && (
            <span className="text-blue-600">
              {likeNewItemsCount} Like New
            </span>
          )}
          {usedItemsCount > 0 && (
            <span className="text-gray-600">
              {usedItemsCount} Used
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 