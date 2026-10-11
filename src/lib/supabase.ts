import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const hasSupabaseConfig =
	/^https:\/\/[^/]+\.supabase\.co\/?$/i.test(supabaseUrl) &&
	supabaseAnonKey.length > 20 &&
	supabaseUrl !== 'https://example-project.supabase.co';

// The admin portal (/admin) keeps its own sign-in, stored under a separate key, so signing in as an
// administrator never replaces the customer signed in to the store in the same browser (and vice versa).
export const isAdminRoute = () => {
	const pathParam = new URLSearchParams(window.location.search).get('path');
	const path = (pathParam || window.location.pathname).replace(/\/+$/, '');
	return path === '/admin' || path.endsWith('/admin');
};

export const supabase = hasSupabaseConfig
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: { storageKey: isAdminRoute() ? 'komse-admin-auth' : 'komse-store-auth' },
		})
	: null;
