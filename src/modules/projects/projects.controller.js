import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

export const list = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Project not found");
  return ok(res, { project: data });
});

export const create = asyncHandler(async (req, res) => {
  const { title, description, location, images, cover_url, year } = req.body;
  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert({ title, description, location, images: images ?? [], cover_url, year })
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return created(res, { project: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["title", "description", "location", "images", "cover_url", "year"]) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from("projects")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Project not found");
  return ok(res, { project: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("projects").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Project deleted" });
});

export const uploadImages = asyncHandler(async (req, res) => {
  // multer.fields() puts uploads under req.files[fieldname]
  const singleArr = req.files?.file || [];
  const arrayArr = req.files?.files || [];

  // Single file (used by the admin cover-image picker)
  if (singleArr[0] && arrayArr.length === 0) {
    const result = await uploadToBucket(buckets.projects, singleArr[0]);
    return created(res, result);
  }

  // Array upload (gallery)
  const all = [...singleArr, ...arrayArr];
  if (all.length === 0) throw new HttpError(400, "No files provided");
  const uploaded = [];
  for (const f of all) {
    const { url, key } = await uploadToBucket(buckets.projects, f);
    uploaded.push({ url, key });
  }
  return created(res, { uploaded });
});
