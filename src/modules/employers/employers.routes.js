import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import { uploadSingle } from "../../middleware/upload.middleware.js";
import * as ctrl from "./employers.controller.js";

const router = Router();

const employerBody = [
  body("full_name").isString().trim().isLength({ min: 1, max: 200 }),
  body("role").optional().isString().isLength({ max: 100 }),
  body("email").optional().isEmail(),
  body("phone").optional().isString().isLength({ max: 40 }),
  body("photo_url").optional().isURL(),
  body("bio").optional().isString().isLength({ max: 2000 }),
];

/**
 * @openapi
 * /api/employers:
 *   get: { tags: [Employers], summary: List employers, responses: { 200: { description: OK } } }
 */
router.get("/", ctrl.list);

/**
 * @openapi
 * /api/employers/upload:
 *   post:
 *     tags: [Employers]
 *     summary: Upload employer photo (admin)
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
  ctrl.uploadPhoto
);

/**
 * @openapi
 * /api/employers/{id}:
 *   get:
 *     tags: [Employers]
 *     summary: Get employer
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK } }
 */
router.get("/:id", [param("id").isString()], validate, ctrl.getOne);

/**
 * @openapi
 * /api/employers:
 *   post:
 *     tags: [Employers]
 *     summary: Create employer (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created } }
 */
router.post("/", requireAuth, adminOnly, employerBody, validate, ctrl.create);

router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [
    param("id").isString(),
    body("full_name").optional().isString().trim().isLength({ min: 1, max: 200 }),
    body("role").optional().isString().isLength({ max: 100 }),
    body("email").optional().isEmail(),
    body("phone").optional().isString().isLength({ max: 40 }),
    body("photo_url").optional().isURL(),
    body("bio").optional().isString().isLength({ max: 2000 }),
  ],
  validate,
  ctrl.update
);

router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
