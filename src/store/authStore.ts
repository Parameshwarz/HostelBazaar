import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
}

// Try to get initial state from localStorage
let initialUser: AuthUser | null = null;
try {
  const storedAuth = localStorage.getItem('hostelbazaar_auth');
  if (storedAuth) {
    const parsed = JSON.parse(storedAuth);
    initialUser = {
      id: parsed.userId,
      email: parsed.email,
      username: parsed.username,
      avatar_url: parsed.avatar_url
    };
  }
} catch (err) {
  console.error('Failed to load stored auth:', err);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: initialUser,
      loading: true,
      setUser: (user) => {
        set({ user, loading: false });
        // Also update our backup auth storage
        if (user) {
          localStorage.setItem('hostelbazaar_auth', JSON.stringify({
            userId: user.id,
            email: user.email,
            username: user.username
          }));
        } else {
          localStorage.removeItem('hostelbazaar_auth');
        }
      },
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Error signing out from Supabase:', error);
          }
        } catch (err) {
          console.error('Error signing out:', err);
        } finally {
          // Always clear local storage and state, even if Supabase signOut fails
          localStorage.removeItem('hostelbazaar_auth');
          sessionStorage.removeItem('hostelbazaar-auth');
          set({ user: null });
          
          // Force page reload to ensure all state is cleared
          window.location.href = '/';
        }
      },
    }),
    {
      name: 'hostelbazaar-auth',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for the Zustand state
      partialize: (state) => ({ user: state.user }), // Only persist the user object
    }
  )
);