import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import { uploadSingle } from "../../middleware/upload.middleware.js";
import * as ctrl from "./services.controller.js";

const router = Router();

const serviceBody = [
  body("title").isString().trim().isLength({ min: 1, max: 200 }),
  body("short_desc").optional().isString().isLength({ max: 500 }),
  body("long_desc").optional().isString().isLength({ max: 5000 }),
  body("icon").optional().isString().isLength({ max: 50 }),
  body("image_url").optional().isURL(),
  body("features").optional().isArray(),
  body("position").optional().isInt({ min: 0 }),
  body("published").optional().isBoolean(),
];

/**
 * @openapi
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: List published services
 *     responses: { 200: { description: OK } }
 */
router.get("/", ctrl.list);

/**
 * @openapi
 * /api/services/upload:
 *   post:
 *     tags: [Services]
 *     summary: Upload service image (admin)
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

/**
 * @openapi
 * /api/services/all:
 *   get:
 *     tags: [Services]
 *     summary: List all services including unpublished (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get("/all", requireAuth, adminOnly, ctrl.listAll);

router.get("/:id", [param("id").isString()], validate, ctrl.getOne);
router.post("/", requireAuth, adminOnly, serviceBody, validate, ctrl.create);
router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [
    param("id").isString(),
    body("title").optional().isString().trim().isLength({ min: 1, max: 200 }),
    body("short_desc").optional().isString().isLength({ max: 500 }),
    body("long_desc").optional().isString().isLength({ max: 5000 }),
    body("icon").optional().isString().isLength({ max: 50 }),
    body("image_url").optional().isURL(),
    body("features").optional().isArray(),
    body("position").optional().isInt({ min: 0 }),
    body("published").optional().isBoolean(),
  ],
  validate,
  ctrl.update
);
router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
