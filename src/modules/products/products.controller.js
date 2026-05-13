import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

const FIELDS = [
  "code",
  "name",
  "description",
  "price",
  "stock",
  "image_url",
  "category",
  "unite",
  "tva",
  "prix_gros_ht",
  "prix_gros_ttc",
  "prix_achat_ttc",
  "remise",
  "etat",
  "fournisseur",
  "code_fournisseur",
  "famille",
  "marge_gros",
  "magasin",
  "promotion",
];

function pickFields(src) {
  const out = {};
  for (const k of FIELDS) {
    if (src[k] !== undefined) out[k] = src[k];
  }
  return out;
}

export const list = asyncHandler(async (req, res) => {
  const { category, q, limit = 50, offset = 0 } = req.query;
  let query = supabaseAdmin.from("products").select("*", { count: "exact" });
  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);
  query = query
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  const { data, error, count } = await query;
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data, total: count });
});

export const getOne = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Product not found");
  return ok(res, { product: data });
});

export const create = asyncHandler(async (req, res) => {
  const payload = pickFields(req.body);
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return created(res, { product: data });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = pickFields(req.body);
  const { data, error } = await supabaseAdmin
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Product not found");
  return ok(res, { product: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Product deleted" });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No file provided");
  const { url, key } = await uploadToBucket(buckets.products, req.file);
  return created(res, { url, key });
});
