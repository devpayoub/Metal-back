import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError, asyncHandler, ok } from "../../utils/response.js";

// Returns only keys prefixed by "public." — safe to expose to the cart page etc.
export const getPublic = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("key,value")
    .like("key", "public.%");
  if (error) throw new HttpError(500, error.message);
  const out = {};
  for (const row of data || []) {
    out[row.key.replace(/^public\./, "")] = row.value;
  }
  return ok(res, { settings: out });
});

// Admin sees every setting.
export const listAll = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("*")
    .order("key", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

// Bulk upsert: { items: [{key, value}] } OR single { key, value }
export const upsert = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items)
    ? req.body.items
    : req.body.key
      ? [{ key: req.body.key, value: req.body.value }]
      : null;
  if (!items) throw new HttpError(400, "Missing key/value or items[]");

  const rows = items.map(({ key, value }) => ({ key, value }));
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .upsert(rows, { onConflict: "key" })
    .select();
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});
