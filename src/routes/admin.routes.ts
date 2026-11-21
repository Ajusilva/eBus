
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/superAdmin.middleware";
import { reviewOrganizationController } from "../controllers/admin.controller";

const router = Router();

router.patch(
  "/admin/organizations/:id/review",
  authenticate,
  requireSuperAdmin,
  reviewOrganizationController
);

export default router;
