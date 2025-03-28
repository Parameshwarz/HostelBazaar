import { Link } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, MessageCircle, Package } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export default function Navigation() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const handleSearch = () => {
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

  const categoryLinks = [
    { name: 'Merch', href: '/merch', icon: Package },
    { name: 'Books and Stationery', href: '/browse?category=books-and-stationery' },
    { name: 'Electronics', href: '/browse?category=electronics' },
    { name: 'Furniture', href: '/browse?category=furniture' },
    { name: 'Clothing', href: '/browse?category=clothing' },
    { name: 'Kitchen', href: '/browse?category=kitchen' },
    { name: 'Appliances', href: '/browse?category=appliances' },
    { name: 'Sports', href: '/browse?category=sports' },
    { name: 'Other', href: '/browse?category=other' }
  ];

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold">HostelBazaar</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search laptops, phones, used items under ₹5000..."
                className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg 
                  focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 
                  bg-indigo-600 text-white text-sm font-medium rounded-md 
                  hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                Search
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Add Merch Link */}
            <Link
              to="/merch"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Merch</span>
            </Link>

            {user ? (
              <>
                <Link to="/messages" className="text-gray-600 hover:text-gray-900">
                  <MessageCircle className="h-6 w-6" />
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => {
                    // Only clear auth-related items
                    const authKeysToRemove = [
                      'hostelbazaar-auth',
                      'hostelbazaar_auth',
                      'supabase.auth.token',
                      'sb-localhost-auth-token', 
                      'sb:token',
                      'supabase.auth.refreshToken',
                      'supabase.auth.accessToken',
                      // Safari-specific items
                      'sb-' + window.location.hostname + '-auth-token'
                    ];
                    
                    // Clear all keys from localStorage - needed for Safari
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && (key.includes('auth') || key.includes('token') || 
                          key.includes('sb-') || key.includes('supabase'))) {
                        localStorage.removeItem(key);
                      }
                    }
                    
                    // Clear ALL session storage (Safari's handling is different)
                    sessionStorage.clear();
                    
                    // Force removal of auth cookies - handle Safari specially
                    document.cookie.split(";").forEach(c => {
                      // Safari requires more specific cookie clearing
                      const cookieName = c.split("=")[0].trim();
                      
                      // Delete cookie with all possible path/domain combinations
                      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
                      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
                    });
                    
                    // Call Supabase sign out directly (needed for Safari)
                    try {
                      supabase.auth.signOut();
                    } catch (e) {
                      console.error("Error signing out from Supabase:", e);
                    }
                    
                    // Reset auth state
                    user && setUser(null);
                    
                    // Safari sometimes caches the page - force a full reload, not just navigation
                    setTimeout(() => {
                      window.location.href = window.location.origin + '/?t=' + new Date().getTime();
                    }, 100);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 