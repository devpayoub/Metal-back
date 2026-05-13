import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { uploadSingle } from "../../middleware/upload.middleware.js";
import * as ctrl from "./users.controller.js";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get current user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get("/", ctrl.getProfile);

/**
 * @openapi
 * /api/profile:
 *   put:
 *     tags: [Profile]
 *     summary: Update current user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.put(
  "/",
  [
    body("full_name").optional().isString().trim().isLength({ max: 120 }),
    body("phone").optional().isString().trim().isLength({ max: 40 }),
    body("address").optional().isString().trim().isLength({ max: 500 }),
    body("avatar_url").optional().isURL(),
  ],
  validate,
  ctrl.updateProfile
);

/**
 * @openapi
 * /api/profile:
 *   delete:
 *     tags: [Profile]
 *     summary: Delete current account
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.delete("/", ctrl.deleteProfile);

/**
 * @openapi
 * /api/profile/avatar:
 *   post:
 *     tags: [Profile]
 *     summary: Upload an avatar image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses: { 200: { description: OK } }
 */
router.post("/avatar", uploadSingle("file"), ctrl.uploadAvatar);

export default router;
