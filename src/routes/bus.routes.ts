
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOrganizationAdmin } from "../middlewares/organizationAdmin.middleware";
import {
  createBusController,
  listBusesController,
} from "../controllers/bus.controller";

const router = Router();

// Cadastrar ônibus
router.post(
  "/organizations/:organizationId/buses",
  authenticate,
  requireOrganizationAdmin,
  createBusController
);

// Listar ônibus da prefeitura
router.get(
  "/organizations/:organizationId/buses",
  authenticate,
  requireOrganizationAdmin,
  listBusesController
);

export default router;
