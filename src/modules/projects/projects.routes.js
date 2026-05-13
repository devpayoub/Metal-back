import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import { uploadFlexible } from "../../middleware/upload.middleware.js";
import * as ctrl from "./projects.controller.js";

const router = Router();

const projectBody = [
  body("title").isString().trim().isLength({ min: 1, max: 200 }),
  body("description").optional().isString().isLength({ max: 5000 }),
  body("location").optional().isString().isLength({ max: 200 }),
  body("images").optional().isArray(),
  body("cover_url").optional().isURL(),
  body("year").optional().isInt({ min: 1900, max: 3000 }),
];

router.get("/", ctrl.list);

/**
 * @openapi
 * /api/projects/upload:
 *   post:
 *     tags: [Projects]
 *     summary: Upload multiple project images (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files: { type: array, items: { type: string, format: binary } }
 *     responses: { 201: { description: Uploaded } }
 */
router.post(
  "/upload",
  requireAuth,
  adminOnly,
  uploadFlexible(12),
  ctrl.uploadImages
);

router.get("/:id", [param("id").isString()], validate, ctrl.getOne);

router.post("/", requireAuth, adminOnly, projectBody, validate, ctrl.create);

router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [
    param("id").isString(),
    body("title").optional().isString().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().isString().isLength({ max: 5000 }),
    body("location").optional().isString().isLength({ max: 200 }),
    body("images").optional().isArray(),
    body("cover_url").optional().isURL(),
    body("year").optional().isInt({ min: 1900, max: 3000 }),
  ],
  validate,
  ctrl.update
);

router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
