import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const supabaseAnon = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export function supabaseForUser(accessToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
