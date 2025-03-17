import { create } from 'zustand';
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null as AuthUser | null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));