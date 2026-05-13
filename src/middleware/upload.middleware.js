import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { supabaseAdmin } from "../config/supabase.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/response.js";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const memory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new HttpError(415, `Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

export const uploadSingle = (field = "file") => memory.single(field);
export const uploadArray = (field = "files", max = 8) => memory.array(field, max);
export const uploadFlexible = (max = 12) =>
  memory.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: max },
  ]);

export async function uploadToBucket(bucket, file, folder = "") {
  if (!file) throw new HttpError(400, "No file provided");
  const ext = path.extname(file.originalname).toLowerCase() || "";
  const key = `${folder ? folder.replace(/\/+$/, "") + "/" : ""}${randomUUID()}${ext}`;

  const { error } = await supabaseAdmin.storage.from(bucket).upload(key, file.buffer, {
    contentType: file.mimetype,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new HttpError(500, `Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export const buckets = env.buckets;
