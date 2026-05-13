import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import productsRoutes from "../modules/products/products.routes.js";
import employersRoutes from "../modules/employers/employers.routes.js";
import projectsRoutes from "../modules/projects/projects.routes.js";
import announcementsRoutes from "../modules/announcements/announcements.routes.js";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import servicesRoutes from "../modules/services/services.routes.js";
import ordersRoutes from "../modules/orders/orders.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import suppliersRoutes from "../modules/suppliers/suppliers.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

router.use("/auth", authRoutes);
router.use("/profile", usersRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/services", servicesRoutes);
router.use("/orders", ordersRoutes);
router.use("/settings", settingsRoutes);
router.use("/employers", employersRoutes);
router.use("/projects", projectsRoutes);
router.use("/announcements", announcementsRoutes);
router.use("/suppliers", suppliersRoutes);

export default router;
