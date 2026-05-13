import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

export const list = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const listAll = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Service not found");
  return ok(res, { service: data });
});

export const create = asyncHandler(async (req, res) => {
  const { title, short_desc, long_desc, icon, image_url, features, position, published } =
    req.body;
  const { data, error } = await supabaseAdmin
    .from("services")
    .insert({
      title,
      short_desc,
      long_desc,
      icon,
      image_url,
      features: features ?? [],
      position: position ?? 0,
      published: published ?? true,
    })
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return created(res, { service: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of [
    "title",
    "short_desc",
    "long_desc",
    "icon",
    "image_url",
    "features",
    "position",
    "published",
  ]) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from("services")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Service not found");
  return ok(res, { service: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("services").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Service deleted" });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No file provided");
  const result = await uploadToBucket(buckets.projects, req.file, "services");
  return created(res, result);
});
