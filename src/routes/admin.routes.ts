
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/superAdmin.middleware";
import { reviewOrganizationController } from "../controllers/admin.controller";

const router = Router();


router.use(authenticate);
router.use(requireSuperAdmin);


router.patch(
  "/admin/organizations/:id/review",
  reviewOrganizationController
);

export default router;
