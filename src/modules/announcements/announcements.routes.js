import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import { uploadSingle } from "../../middleware/upload.middleware.js";
import * as ctrl from "./announcements.controller.js";

const router = Router();

const announcementBody = [
  body("title").isString().trim().isLength({ min: 1, max: 200 }),
  body("body").optional().isString().isLength({ max: 10000 }),
  body("type").optional().isIn(["job", "promotion", "news"]),
  body("image_url").optional().isURL(),
  body("published").optional().isBoolean(),
];

/**
 * @openapi
 * /api/announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: List announcements
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [job, promotion, news] }
 *     responses: { 200: { description: OK } }
 */
router.get("/", ctrl.list);

/**
 * @openapi
 * /api/announcements/upload:
 *   post:
 *     tags: [Announcements]
 *     summary: Upload announcement image (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses: { 201: { description: Uploaded } }
 */
router.post(
  "/upload",
  requireAuth,
  adminOnly,
  uploadSingle("file"),
  ctrl.uploadImage
);

router.get("/:id", [param("id").isString()], validate, ctrl.getOne);

router.post("/", requireAuth, adminOnly, announcementBody, validate, ctrl.create);
router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [
    param("id").isString(),
    body("title").optional().isString().trim().isLength({ min: 1, max: 200 }),
    body("body").optional().isString().isLength({ max: 10000 }),
    body("type").optional().isIn(["job", "promotion", "news"]),
    body("image_url").optional().isURL(),
    body("published").optional().isBoolean(),
  ],
  validate,
  ctrl.update
);
router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
