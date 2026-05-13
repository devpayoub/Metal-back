import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import { uploadSingle } from "../../middleware/upload.middleware.js";
import * as ctrl from "./products.controller.js";

const router = Router();

const productBody = [
  body("name").isString().trim().isLength({ min: 1, max: 200 }),
  body("description").optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body("price").isFloat({ min: 0 }),
  body("stock").optional({ nullable: true }).isInt({ min: 0 }),
  body("image_url").optional({ nullable: true, checkFalsy: true }).isURL(),
  body("category").optional({ nullable: true }).isString().isLength({ max: 80 }),
  body("code").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 80 }),
  body("unite").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 20 }),
  body("tva").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body("prix_gros_ht").optional({ nullable: true }).isFloat({ min: 0 }),
  body("prix_gros_ttc").optional({ nullable: true }).isFloat({ min: 0 }),
  body("prix_achat_ttc").optional({ nullable: true }).isFloat({ min: 0 }),
  body("remise").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body("etat").optional({ nullable: true }).isIn(["Actif", "Inactif"]),
  body("fournisseur").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body("code_fournisseur").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 80 }),
  body("famille").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 80 }),
  body("marge_gros").optional({ nullable: true }).isFloat({ min: 0 }),
  body("magasin").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("promotion").optional({ nullable: true }).isBoolean(),
];

const productPatchBody = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 200 }),
  body("description").optional({ nullable: true }).isString().isLength({ max: 5000 }),
  body("price").optional().isFloat({ min: 0 }),
  body("stock").optional({ nullable: true }).isInt({ min: 0 }),
  body("image_url").optional({ nullable: true, checkFalsy: true }).isURL(),
  body("category").optional({ nullable: true }).isString().isLength({ max: 80 }),
  body("code").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 80 }),
  body("unite").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 20 }),
  body("tva").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body("prix_gros_ht").optional({ nullable: true }).isFloat({ min: 0 }),
  body("prix_gros_ttc").optional({ nullable: true }).isFloat({ min: 0 }),
  body("prix_achat_ttc").optional({ nullable: true }).isFloat({ min: 0 }),
  body("remise").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body("etat").optional({ nullable: true }).isIn(["Actif", "Inactif"]),
  body("fournisseur").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body("code_fournisseur").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 80 }),
  body("famille").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 80 }),
  body("marge_gros").optional({ nullable: true }).isFloat({ min: 0 }),
  body("magasin").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("promotion").optional({ nullable: true }).isBoolean(),
];

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: offset
 *         schema: { type: integer }
 *     responses: { 200: { description: OK } }
 */
router.get("/", ctrl.list);

/**
 * @openapi
 * /api/products/upload:
 *   post:
 *     tags: [Products]
 *     summary: Upload product image (admin)
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
router.post("/upload", requireAuth, adminOnly, uploadSingle("file"), ctrl.uploadImage);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses: { 200: { description: OK } }
 */
router.get("/:id", [param("id").isString()], validate, ctrl.getOne);

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create product (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created } }
 */
router.post("/", requireAuth, adminOnly, productBody, validate, ctrl.create);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [param("id").isString(), ...productPatchBody],
  validate,
  ctrl.update
);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.delete("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.remove);

export default router;
