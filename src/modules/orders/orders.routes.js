import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth, optionalAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import * as ctrl from "./orders.controller.js";

const router = Router();

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order (public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_name, customer_phone, items]
 *             properties:
 *               customer_name:    { type: string }
 *               customer_phone:   { type: string }
 *               customer_address: { type: string }
 *               notes:            { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product_id, qty]
 *                   properties:
 *                     product_id: { type: string, format: uuid }
 *                     qty:        { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Created — includes whatsapp_url }
 */
router.post(
  "/",
  optionalAuth,
  [
    body("customer_name").isString().trim().isLength({ min: 1, max: 200 }),
    body("customer_phone").isString().trim().isLength({ min: 4, max: 40 }),
    body("customer_address").optional().isString().isLength({ max: 500 }),
    body("notes").optional().isString().isLength({ max: 2000 }),
    body("items").isArray({ min: 1 }),
    body("items.*.product_id").isString(),
    body("items.*.qty").isInt({ min: 1 }),
  ],
  validate,
  ctrl.create
);

/**
 * @openapi
 * /api/orders/mine:
 *   get:
 *     tags: [Orders]
 *     summary: List the authenticated user's orders
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get("/mine", requireAuth, ctrl.listMine);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get("/", requireAuth, adminOnly, ctrl.list);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK } }
 */
router.get("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.getOne);

/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [param("id").isString(), body("status").isIn(STATUSES)],
  validate,
  ctrl.updateStatus
);

router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
