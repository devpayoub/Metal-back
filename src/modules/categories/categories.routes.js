import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import * as ctrl from "./categories.controller.js";

const router = Router();

const categoryBody = [
  body("name").isString().trim().isLength({ min: 1, max: 100 }),
  body("slug").optional().isString().trim().isLength({ max: 100 }),
  body("description").optional().isString().isLength({ max: 1000 }),
];

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List product categories
 *     responses: { 200: { description: OK } }
 */
router.get("/", ctrl.list);

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by id
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK } }
 */
router.get("/:id", [param("id").isString()], validate, ctrl.getOne);

/**
 * @openapi
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created } }
 */
router.post("/", requireAuth, adminOnly, categoryBody, validate, ctrl.create);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [
    param("id").isString(),
    body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
    body("slug").optional().isString().trim().isLength({ max: 100 }),
    body("description").optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  ctrl.update
);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
