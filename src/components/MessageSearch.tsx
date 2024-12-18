import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { useMessageSearch } from '../hooks/useMessageSearch';
import { useNavigate } from 'react-router-dom';
import TimeAgo from 'react-timeago';

export const MessageSearch = () => {
  const [query, setQuery] = useState('');
  const { results, isSearching, searchMessages } = useMessageSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        searchMessages(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchMessages]);

  return (
    <div className="relative">
      <div className="flex items-center px-4 py-2 border-b">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full px-3 py-1 focus:outline-none"
        />
        {isSearching && <Loader className="w-5 h-5 text-gray-400 animate-spin" />}
      </div>

      {query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg max-h-96 overflow-y-auto z-50">
          {results.map((result) => (
            <button
              key={result.messageId}
              onClick={() => {
                navigate(`/messages/${result.chatId}`);
                setQuery('');
              }}
              className="w-full p-4 text-left hover:bg-gray-50 flex flex-col space-y-1"
            >
              <p className="text-sm line-clamp-2">{result.content}</p>
              <span className="text-xs text-gray-500">
                <TimeAgo date={result.timestamp} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 