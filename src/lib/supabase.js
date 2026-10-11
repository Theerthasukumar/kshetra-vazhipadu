import { createClient } from '@supabase/supabase-js';

// 1. Read Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 2. Validate configuration
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 20
  );
};

// 3. Initialize Supabase Client
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper: Transform DB row (snake_case) to Frontend camelCase
export const transformDbToApp = (row) => ({
  id: row.id,
  tokenNo: row.token_no,
  templeId: row.temple_id,
  vazhipaduName: row.vazhipadu_name,
  devoteeName: row.devotee_name,
  nakshathram: row.nakshathram,
  date: row.date,
  time: row.time,
  amount: Number(row.amount),
  status: row.status,
  collected: Boolean(row.collected),
  phone: row.phone,
  createdAt: row.created_at
});

// Helper: Transform Frontend camelCase to DB row (snake_case)
export const transformAppToDb = (item) => ({
  token_no: item.tokenNo,
  temple_id: item.templeId,
  vazhipadu_name: item.vazhipaduName,
  devotee_name: item.devoteeName,
  nakshathram: item.nakshathram,
  date: item.date,
  time: item.time,
  amount: item.amount,
  status: item.status || 'Ready for Collection',
  collected: Boolean(item.collected),
  phone: item.phone
});

// 4. Fetch All Bookings (with automatic local fallback)
export async function fetchAllBookings() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        return data.map(transformDbToApp);
      }
      console.warn('Supabase fetch error, falling back to local API:', error?.message);
    } catch (err) {
      console.warn('Supabase network error, falling back to local API:', err);
    }
  }

  // Graceful Fallback: Local API
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // offline
  }

  return [];
}

// 5. Insert New Bookings (Single or Multi-Devotee)
export async function insertBookings(items) {
  const itemsArray = Array.isArray(items) ? items : [items];

  // Try Supabase first if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbRows = itemsArray.map(transformAppToDb);
      const { data, error } = await supabase
        .from('bookings')
        .insert(dbRows)
        .select();

      if (!error && data) {
        // Also fire-and-forget sync local mock for development consistency
        try {
          fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemsArray)
          }).catch(() => {});
        } catch {}
        return { success: true, source: 'supabase', count: data.length };
      }
      console.error('Supabase insert error:', error);
    } catch (err) {
      console.error('Supabase insert exception:', err);
    }
  }

  // Fallback: Local API
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemsArray)
    });
    return { success: res.ok, source: 'local' };
  } catch (err) {
    console.error('Local API insert failed:', err);
    return { success: false, error: err };
  }
}

// 6. Toggle Collected Status
export async function toggleCollectedStatus(tokenNo, newStatus) {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ collected: newStatus })
        .eq('token_no', tokenNo);

      if (!error) {
        try {
          fetch('/api/bookings/toggle-collected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenNo })
          }).catch(() => {});
        } catch {}
        return true;
      }
      console.error('Supabase update status error:', error);
    } catch (err) {
      console.error('Supabase update status exception:', err);
    }
  }

  // Fallback: Local API
  try {
    const res = await fetch('/api/bookings/toggle-collected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenNo })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 7. Realtime Subscription (WebSocket live stream from Supabase)
export function subscribeToRealtimeBookings(onInsert, onUpdate) {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const channel = supabase
      .channel('temple-bookings-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          if (onInsert && payload.new) {
            onInsert(transformDbToApp(payload.new));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload) => {
          if (onUpdate && payload.new) {
            onUpdate(transformDbToApp(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}
