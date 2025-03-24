import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Special component to handle sign out issues on Vercel
 * This component performs extra steps to ensure sign out works in production
 */
const VercelSignOutFix: React.FC = () => {
  useEffect(() => {
    // Only run this in production (Vercel)
    if (process.env.NODE_ENV === 'production' && window.location.pathname === '/signout') {
      console.log('VercelSignOutFix: Performing special sign out procedure for Vercel');
      
      const performSignOut = async () => {
        // 1. Sign out from Supabase
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Supabase sign out error:', err);
        }
        
        // 2. Clear all storage
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (err) {
          console.error('Storage clear error:', err);
        }
        
        // 3. Clear all cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        // 4. Redirect to home after a short delay
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      };
      
      performSignOut();
    }
  }, []);
  
  return null; // This is an invisible component
};

export default VercelSignOutFix; 