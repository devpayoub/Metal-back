import { HttpError } from "../utils/response.js";

export function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, "Authentication required"));
    const roles = req.user.roles || [];
    const ok = allowed.some((r) => roles.includes(r));
    if (!ok) return next(new HttpError(403, "Forbidden: insufficient role"));
    next();
  };
}

export const adminOnly = requireRole("admin");
export const clientOnly = requireRole("client");
