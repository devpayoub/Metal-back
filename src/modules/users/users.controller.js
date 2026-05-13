import { supabaseAdmin } from "../../config/supabase.js";
import { uploadToBucket, buckets } from "../../middleware/upload.middleware.js";
import { HttpError, asyncHandler, ok } from "../../utils/response.js";

export const getProfile = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  return ok(res, { profile: data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, phone, address, avatar_url } = req.body;
  const patch = { user_id: req.user.id, email: req.user.email };
  if (full_name !== undefined) patch.full_name = full_name;
  if (phone !== undefined) patch.phone = phone;
  if (address !== undefined) patch.address = address;
  if (avatar_url !== undefined) patch.avatar_url = avatar_url;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert(patch, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return ok(res, { profile: data });
});

export const deleteProfile = asyncHandler(async (req, res) => {
  const { error: profErr } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("user_id", req.user.id);
  if (profErr) throw new HttpError(500, profErr.message);

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("user_id", req.user.id);
  if (roleErr) throw new HttpError(500, roleErr.message);

  const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);
  if (authErr) throw new HttpError(500, authErr.message);

  return ok(res, { message: "Account deleted" });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "No avatar file provided");
  const { url } = await uploadToBucket(buckets.profiles, req.file, req.user.id);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert(
      { user_id: req.user.id, email: req.user.email, avatar_url: url },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw new HttpError(500, error.message);
  return ok(res, { profile: data, avatar_url: url });
});
