import { supabaseAdmin } from "../../config/supabase.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const list = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Category not found");
  return ok(res, { category: data });
});

export const create = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const slug = req.body.slug?.trim() || slugify(name);
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({ name: name.trim(), slug, description })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new HttpError(409, "Category name or slug already exists");
    throw new HttpError(500, error.message);
  }
  return created(res, { category: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["name", "slug", "description"]) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  if (patch.name) patch.name = patch.name.trim();
  if (patch.slug) patch.slug = slugify(patch.slug);
  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new HttpError(409, "Category name or slug already exists");
    throw new HttpError(500, error.message);
  }
  if (!data) throw new HttpError(404, "Category not found");
  return ok(res, { category: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Category deleted" });
});
