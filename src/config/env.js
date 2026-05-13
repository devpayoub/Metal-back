import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  buckets: {
    products: process.env.SUPABASE_BUCKET_PRODUCTS || "product",
    projects: process.env.SUPABASE_BUCKET_PROJECTS || "projects",
    profiles: process.env.SUPABASE_BUCKET_PROFILES || "profiles",
    announcements: process.env.SUPABASE_BUCKET_ANNOUNCEMENTS || "announcements",
  },
};
