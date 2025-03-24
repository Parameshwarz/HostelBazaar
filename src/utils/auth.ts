import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Centralized sign out function that ensures all auth state is properly cleared
 * 
 * This function handles:
 * 1. Signing out from Supabase
 * 2. Clearing local storage
 * 3. Clearing session storage
 * 4. Clearing cookies
 * 5. Resetting Zustand auth store
 * 6. Redirecting to home page
 */
export const signOutCompletely = async (): Promise<void> => {
  try {
    // 1. Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
    }
  } catch (err) {
    console.error('Exception during Supabase sign out:', err);
  } finally {
    // 2. Clear all auth-related items from localStorage
    // Clear any possible key variations that might exist
    const keysToRemove = [
      'hostelbazaar_auth',
      'supabase.auth.token',
      'sb-localhost-auth-token',
      'sb:token',
      'supabase.auth.refreshToken',
      'supabase.auth.accessToken',
      'supabase.session',
      // Add potential Vercel-specific keys
      'supabase-auth-token',
      'sb-' + window.location.hostname.replace(/[^a-zA-Z0-9]/g, '-') + '-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed to remove ${key} from localStorage`, e);
      }
    });
    
    // 3. Clear session storage
    try {
      sessionStorage.clear(); // Clear everything to be safe
    } catch (e) {
      console.error('Failed to clear sessionStorage', e);
    }
    
    // 4. Clear cookies that might be related to auth
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // 5. Reset Zustand auth store
    useAuthStore.getState().setUser(null);
    
    // 6. Force a hard reload rather than just a redirect
    // This ensures the app state is completely reset
    setTimeout(() => {
      window.location.href = '/';
      
      // If we're in production (probably Vercel), try an alternative approach after a small delay
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          window.location.replace('/');
          console.log('Forcing second redirect in production environment');
        }, 300);
      }
    }, 100);
  }
}; 