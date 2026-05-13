import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

export const list = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("employers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("employers")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Employer not found");
  return ok(res, { employer: data });
});

export const create = asyncHandler(async (req, res) => {
  const { full_name, role, email, phone, photo_url, bio } = req.body;
  const { data, error } = await supabaseAdmin
    .from("employers")
    .insert({ full_name, role, email, phone, photo_url, bio })
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return created(res, { employer: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["full_name", "role", "email", "phone", "photo_url", "bio"]) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from("employers")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Employer not found");
  return ok(res, { employer: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("employers").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Employer deleted" });
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No file provided");
  const result = await uploadToBucket(buckets.profiles, req.file, "employers");
  return created(res, result);
});
