import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

const FIELDS = [
  "code",
  "nom_raison_sociale",
  "telephone",
  "adresse",
  "region",
  "responsable",
  "identifiant_fiscal",
  "solde",
  "exo",
  "tim",
  "fod",
  "bloc",
  "categorie",
  "compte_commercial",
  "compte_comptable",
  "delai_paiement",
];

function pickFields(src) {
  const out = {};
  for (const k of FIELDS) {
    if (src[k] !== undefined) out[k] = src[k];
  }
  return out;
}

async function nextCode() {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("code")
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  return data?.code ? data.code + 1 : 1;
}

export const list = asyncHandler(async (req, res) => {
  const { q, region, categorie, limit = 100, offset = 0 } = req.query;
  let query = supabaseAdmin.from("suppliers").select("*", { count: "exact" });
  if (region) query = query.eq("region", region);
  if (categorie) query = query.eq("categorie", categorie);
  if (q) query = query.ilike("nom_raison_sociale", `%${q}%`);
  query = query
    .order("code", { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1);
  const { data, error, count } = await query;
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data, total: count });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Supplier not found");
  return ok(res, { supplier: data });
});

export const create = asyncHandler(async (req, res) => {
  const payload = pickFields(req.body);
  if (payload.code === undefined) {
    payload.code = await nextCode();
  }
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .insert(payload)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new HttpError(409, "Supplier code already exists");
    throw new HttpError(500, error.message);
  }
  return created(res, { supplier: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = pickFields(req.body);
  const { data, error } = await supabaseAdmin
    .from("suppliers")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new HttpError(409, "Supplier code already exists");
    throw new HttpError(500, error.message);
  }
  if (!data) throw new HttpError(404, "Supplier not found");
  return ok(res, { supplier: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("suppliers").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Supplier deleted" });
});
