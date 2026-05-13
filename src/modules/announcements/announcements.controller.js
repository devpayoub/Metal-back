import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

export const list = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let query = supabaseAdmin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);
  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);
  return ok(res, { items: data });
});

export const getOne = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Announcement not found");
  return ok(res, { announcement: data });
});

export const create = asyncHandler(async (req, res) => {
  const { title, body, type, image_url, published } = req.body;
  const { data, error } = await supabaseAdmin
    .from("announcements")
    .insert({ title, body, type, image_url, published: published ?? true })
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return created(res, { announcement: data });
});

export const update = asyncHandler(async (req, res) => {
  const patch = {};
  for (const k of ["title", "body", "type", "image_url", "published"]) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from("announcements")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Announcement not found");
  return ok(res, { announcement: data });
});

export const remove = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from("announcements").delete().eq("id", req.params.id);
  if (error) throw new HttpError(500, error.message);
  return ok(res, { message: "Announcement deleted" });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No file provided");
  const { url, key } = await uploadToBucket(buckets.announcements, req.file);
  return created(res, { url, key });
});
