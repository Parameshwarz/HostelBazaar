import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Dedicated sign out page that ensures sign out works correctly on all environments,
 * especially Vercel deployments
 */
const SignOutPage: React.FC = () => {
  const [status, setStatus] = useState('Signing you out...');
  const setUser = useAuthStore(state => state.setUser);
  
  useEffect(() => {
    const performFullSignOut = async () => {
      try {
        // 1. Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase sign out error:', error);
          setStatus('Error signing out. Trying alternative methods...');
        }
      } catch (err) {
        console.error('Exception during sign out:', err);
      }
      
      // 2. Clear all possible storage items
      try {
        // Clear local storage
        localStorage.clear();
        
        // Clear session storage
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // Reset auth store
        setUser(null);
        
        setStatus('Sign out successful. Redirecting...');
      } catch (err) {
        console.error('Error clearing storage:', err);
        setStatus('Error during sign out process. Please try closing your browser.');
      }
      
      // 3. Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };
    
    performFullSignOut();
  }, [setUser]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Signing Out</h2>
          <p className="mt-2 text-sm text-gray-600">{status}</p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-gray-500">
            If you're not redirected automatically, 
            <a href="/" className="text-indigo-600 hover:text-indigo-500 ml-1">
              click here to go to the home page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignOutPage; 