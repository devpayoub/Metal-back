import { Router } from "express";
import { body, param } from "express-validator";
import { validate } from "../../middleware/validate.middleware.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { adminOnly } from "../../middleware/role.middleware.js";
import * as ctrl from "./suppliers.controller.js";

const router = Router();

const supplierBody = [
  body("code").optional({ nullable: true }).isInt({ min: 1 }),
  body("nom_raison_sociale").isString().trim().isLength({ min: 1, max: 300 }),
  body("telephone").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("adresse").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 500 }),
  body("region").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("responsable").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body("identifiant_fiscal").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("solde").optional({ nullable: true }).isFloat(),
  body("exo").optional({ nullable: true }).isBoolean(),
  body("tim").optional({ nullable: true }).isBoolean(),
  body("fod").optional({ nullable: true }).isBoolean(),
  body("bloc").optional({ nullable: true }).isBoolean(),
  body("categorie").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("compte_commercial").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("compte_comptable").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("delai_paiement").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
];

const supplierPatchBody = [
  body("code").optional({ nullable: true }).isInt({ min: 1 }),
  body("nom_raison_sociale").optional().isString().trim().isLength({ min: 1, max: 300 }),
  body("telephone").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("adresse").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 500 }),
  body("region").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("responsable").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 200 }),
  body("identifiant_fiscal").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("solde").optional({ nullable: true }).isFloat(),
  body("exo").optional({ nullable: true }).isBoolean(),
  body("tim").optional({ nullable: true }).isBoolean(),
  body("fod").optional({ nullable: true }).isBoolean(),
  body("bloc").optional({ nullable: true }).isBoolean(),
  body("categorie").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 120 }),
  body("compte_commercial").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("compte_comptable").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
  body("delai_paiement").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }),
];

/**
 * @openapi
 * /api/suppliers:
 *   get:
 *     tags: [Suppliers]
 *     summary: List suppliers (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *       - in: query
 *         name: categorie
 *         schema: { type: string }
 *     responses: { 200: { description: OK } }
 */
router.get("/", requireAuth, adminOnly, ctrl.list);

router.get("/:id", requireAuth, adminOnly, [param("id").isString()], validate, ctrl.getOne);

/**
 * @openapi
 * /api/suppliers:
 *   post:
 *     tags: [Suppliers]
 *     summary: Create supplier (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created } }
 */
router.post("/", requireAuth, adminOnly, supplierBody, validate, ctrl.create);

router.put(
  "/:id",
  requireAuth,
  adminOnly,
  [param("id").isString(), ...supplierPatchBody],
  validate,
  ctrl.update
);

router.delete(
  "/:id",
  requireAuth,
  adminOnly,
  [param("id").isString()],
  validate,
  ctrl.remove
);

export default router;
