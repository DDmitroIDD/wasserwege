// Supabase client module: initializes the Supabase JS client for the app.
// Модуль клиента Supabase: инициализирует клиент Supabase JS для приложения.
//
// Uses the public anon key, which is safe to expose in client-side code
// because access is restricted by Row Level Security (RLS) policies
// configured in the Supabase dashboard.
// Использует публичный anon-ключ, который безопасно раскрывать в клиентском
// коде, так как доступ ограничен политиками Row Level Security (RLS),
// настроенными в панели управления Supabase.

const SUPABASE_URL = 'https://illdwjdggnopizqoeaun.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VuPMwSIIsAvOeqeTLtk1hA_MbI0WmTL';

// Lazily create a single shared Supabase client instance.
// Лениво создаёт единственный общий экземпляр клиента Supabase.
let client = null;

export function getSupabaseClient() {
  if (!client) {
    if (!window.supabase) {
      console.error('Supabase SDK not loaded');
      return null;
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
