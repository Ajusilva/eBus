
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createOrganizationController } from "../controllers/organization.controller";

const router = Router();

// Solicitar o cadastro de uma prefeitura
router.post(
  "/organizations",
  authenticate,
  createOrganizationController
);

export default router;
