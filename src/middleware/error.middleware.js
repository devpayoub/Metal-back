import multer from "multer";
import { HttpError } from "../utils/response.js";
import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message, ...err.extra });
  }
  const status = err.status || 500;
  const payload = { success: false, error: err.message || "Internal Server Error" };
  if (env.nodeEnv !== "production") payload.stack = err.stack;
  if (env.nodeEnv !== "production") console.error(err);
  res.status(status).json(payload);
}
