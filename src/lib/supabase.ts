import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const hasSupabaseConfig =
	/^https:\/\/[^/]+\.supabase\.co\/?$/i.test(supabaseUrl) &&
	supabaseAnonKey.length > 20 &&
	supabaseUrl !== 'https://example-project.supabase.co';

export const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;
