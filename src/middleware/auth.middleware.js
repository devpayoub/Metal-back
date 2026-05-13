import { supabaseAdmin } from "../config/supabase.js";
import { HttpError } from "../utils/response.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or malformed Authorization header");
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) throw new HttpError(401, "Missing access token");

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      throw new HttpError(401, "Invalid or expired token");
    }

    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    req.user = {
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata,
      roles: (roleRows ?? []).map((r) => r.role),
    };
    req.accessToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return next();
    const token = header.slice("Bearer ".length).trim();
    if (!token) return next();
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data?.user) {
      const { data: roleRows } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      req.user = {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata,
        roles: (roleRows ?? []).map((r) => r.role),
      };
      req.accessToken = token;
    }
    next();
  } catch {
    next();
  }
}
