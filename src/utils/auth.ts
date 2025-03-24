import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Centralized sign out function that ensures all auth state is properly cleared
 * 
 * This function handles:
 * 1. Signing out from Supabase
 * 2. Clearing local storage
 * 3. Clearing session storage
 * 4. Resetting Zustand auth store
 * 5. Redirecting to home page
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
    localStorage.removeItem('hostelbazaar_auth');
    localStorage.removeItem('supabase.auth.token');
    
    // 3. Clear session storage
    sessionStorage.removeItem('hostelbazaar-auth');
    
    // 4. Reset Zustand auth store
    useAuthStore.getState().setUser(null);
    
    // 5. Redirect to home page
    window.location.href = '/';
  }
}; 