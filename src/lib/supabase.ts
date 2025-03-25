import { createClient } from '@supabase/supabase-js';
import { Database } from '../utils/supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configure Supabase with optimized settings for better performance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Add shorter timeout to prevent hanging requests
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-application-name': 'hostel-bazaar' },
    // Improve fetch reliability with longer timeout
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // 15 second timeout to avoid hanging requests
        signal: AbortSignal.timeout(15000)
      });
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Reduced from 40 to prevent rate limiting
      fastlaneOnly: true // Use fastest connection
    }
  },
  db: {
    schema: 'public'
  }
});

// Add connection status monitoring via realtime client events
// Note: We're using subscription status instead of direct realtime events
if (import.meta.env.DEV) {
  // Monitor channel subscription status instead
  const debugChannel = supabase.channel('debug-connection');
  
  debugChannel
    .subscribe((status) => {
      console.log('Supabase connection status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Supabase realtime connected');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.log('⚠️ Supabase realtime disconnected:', status);
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Supabase realtime connection timed out');
      }
    });
}

// Add helper to reuse same channel for similar subscriptions
const activeChannels: Record<string, any> = {};

export const getOrCreateChannel = (channelName: string) => {
  if (!activeChannels[channelName]) {
    activeChannels[channelName] = supabase.channel(channelName);
  }
  return activeChannels[channelName];
};