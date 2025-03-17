import React from 'react'
import { Link } from 'react-router-dom'

type Props = {
  item: any
  type: 'post' | 'user' | 'community'
}

export const SearchResultItem = ({ item, type }: Props) => {
  if (type === 'post') {
    return (
      <Link 
        to={`/items/${item.id}`}
        className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          {item.images?.[0] && (
            <img 
              src={item.images[0]} 
              alt={item.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-500">
              ₹{item.price} • {item.condition}
            </p>
            {item.user && (
              <p className="text-xs text-gray-400">
                Posted by {item.user.username}
              </p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Add handling for user and community types if needed
  return null
} 