import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

/**
 * Initialize auth state from Supabase session
 * This function should be called once when the app loads
 */
export const initializeAuth = async () => {
  try {
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting auth session:', error);
      return;
    }
    
    // If we have a session, fetch the user profile and set in auth store
    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      
      // Set the user in the auth store
      useAuthStore.getState().setUser({
        id: session.user.id,
        email: session.user.email,
        username: profile?.username,
        avatar_url: profile?.avatar_url
      });
      
      console.log('User authenticated from session');
    }
  } catch (err) {
    console.error('Failed to initialize auth:', err);
  }
};

// Setup auth state change listener
export const setupAuthListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, fetch their profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        useAuthStore.getState().setUser({
          id: session.user.id,
          email: session.user.email,
          username: profile?.username,
          avatar_url: profile?.avatar_url
        });
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        useAuthStore.getState().setUser(null);
      }
    }
  );
  
  // Return the subscription to allow unsubscribing if needed
  return subscription;
};

// Call this function to initialize auth on app startup
export const initAuth = () => {
  initializeAuth();
  return setupAuthListener();
}; 