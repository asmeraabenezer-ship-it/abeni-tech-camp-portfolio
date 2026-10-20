// ========================================================
// Supabase Configuration for Abeni Tech Camp Portfolio
// ========================================================
// Replace the two placeholders below with your Supabase credentials:
// Found in: Supabase Dashboard -> Project Settings -> API
// ========================================================

const SUPABASE_URL = 'https://qnholjcnevpgvuesddbq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_AlLQ6fQBfr2G05r-MLyK5Q_ozTaZcZJ';

// Admin Portal passcode for managing projects via admin.html
const ADMIN_PASSCODE = 'abeni2026';

// Global Supabase client instance
let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase) {
    if (SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT_ID') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase connected successfully');
        } catch (err) {
            console.error('❌ Supabase initialization error:', err);
        }
    } else {
        console.warn('⚠️ Supabase URL or Anon Key has not been set yet in supabase-config.js');
    }
}
