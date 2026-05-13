import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import * as ctrl from "./settings.controller.js";

const router = Router();

/**
 * @openapi
 * /api/settings/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public settings (whatsapp_number, delivery_fee, currency, company_name)
 *     responses: { 200: { description: OK } }
 */
router.get("/public", ctrl.getPublic);

/**
 * @openapi
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: List all settings (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get("/", requireAuth, adminOnly, ctrl.listAll);

/**
 * @openapi
 * /api/settings:
 *   put:
 *     tags: [Settings]
 *     summary: Upsert one or many settings (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.put(
  "/",
  requireAuth,
  adminOnly,
  [
    body("key").optional().isString(),
    body("items").optional().isArray(),
  ],
  validate,
  ctrl.upsert
);

export default router;
