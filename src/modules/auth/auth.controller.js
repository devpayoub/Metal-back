import { supabaseAdmin, supabaseAnon } from "../../config/supabase.js";
import { HttpError, asyncHandler, created, ok } from "../../utils/response.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password, full_name } = req.body;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (error) throw new HttpError(400, error.message);

  // The `on_auth_user_created` trigger already inserts the profile row
  // and grants the 'client' role. We upsert here to be safe (and to
  // patch in full_name if it wasn't provided via user_metadata).
  const assignedRole = "client";
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert(
      { user_id: data.user.id, role: assignedRole },
      { onConflict: "user_id,role", ignoreDuplicates: true }
    );
  if (roleErr) throw new HttpError(500, `Failed to assign role: ${roleErr.message}`);

  const { error: profErr } = await supabaseAdmin.from("profiles").upsert({
    user_id: data.user.id,
    email: data.user.email,
    full_name: full_name || null,
  });
  if (profErr && profErr.code !== "23505") {
    throw new HttpError(500, `Failed to create profile: ${profErr.message}`);
  }

  return created(res, {
    user: { id: data.user.id, email: data.user.email, full_name, role: assignedRole },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
  if (error) throw new HttpError(401, error.message);

  const { data: roleRows } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);

  return ok(res, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    token_type: data.session.token_type,
    user: {
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata,
      roles: (roleRows ?? []).map((r) => r.role),
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.accessToken) {
    await supabaseAdmin.auth.admin.signOut(req.accessToken).catch(() => {});
  }
  return ok(res, { message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user });
});
