import { createClient } from '@supabase/supabase-js';
import { Database } from '../utils/supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configure Supabase with enhanced real-time capabilities
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: { 'x-application-name': 'hostel-bazaar' }
  },
  realtime: {
    params: {
      eventsPerSecond: 40,
      fastlaneOnly: false
    }
  },
  db: {
    schema: 'public'
  }
});