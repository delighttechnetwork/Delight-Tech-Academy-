import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a lazy-loaded Supabase client instance safely.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes('MY_SUPABASE') || anonKey.includes('sb_publishable')) {
    return null;
  }

  try {
    supabaseInstance = createClient(url.trim(), anonKey.trim());
    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Pull all tables from Supabase into local cache.
 * If Supabase is empty, seeds it with local database state instead!
 */
export async function pullFromSupabase(supabase: SupabaseClient, localDb: any): Promise<any> {
  try {
    // Check if courses table is empty on Supabase to determine if we need initial seeding
    const { data: remoteCourses, error: courseCheckError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    if (courseCheckError) {
      console.error('Error checking remote courses, may lack tables:', courseCheckError);
      return localDb;
    }

    const isSupabaseEmpty = !remoteCourses || remoteCourses.length === 0;

    if (isSupabaseEmpty) {
      console.log('Supabase tables are empty. Auto-seeding active database state into Supabase...');
      await pushToSupabase(supabase, localDb);
      return localDb;
    }

    // Pull tables
    const tables = ['profiles', 'categories', 'courses', 'course_stages', 'enrollments', 'progress', 'certificates', 'registrations'];
    const syncedDb: any = {};

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error pulling from table "${table}":`, error);
        syncedDb[table] = localDb[table] || [];
      } else {
        syncedDb[table] = data || [];
      }
    }

    return syncedDb;
  } catch (err) {
    console.error('Pull sync failed, falling back to local DB:', err);
    return localDb;
  }
}

/**
 * Push all local tables or specified changes up to Supabase using upsert.
 */
export async function pushToSupabase(supabase: SupabaseClient, db: any): Promise<void> {
  try {
    const tables = ['profiles', 'categories', 'courses', 'course_stages', 'enrollments', 'progress', 'certificates', 'registrations'];
    
    for (const table of tables) {
      const records = db[table];
      if (records && records.length > 0) {
        // Run bulk upserts
        const { error } = await supabase.from(table).upsert(records);
        if (error) {
          console.error(`Error pushing table "${table}" to Supabase:`, error);
        }
      }
    }
    console.log('Successfully completed data sync push to Supabase.');
  } catch (err) {
    console.error('Push sync failed:', err);
  }
}
