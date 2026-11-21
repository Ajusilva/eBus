
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOrganizationAdmin } from "../middlewares/organizationAdmin.middleware";
import {
  addDriverController,
  createDriverController,
  listDriversController,
} from "../controllers/driver.controller";

const router = Router();

// Cadastrar um novo motorista na prefeitura
router.post(
  "/organizations/:organizationId/drivers/register",
  authenticate,
  requireOrganizationAdmin,
  createDriverController
);

// Vincular um motorista já existente à prefeitura
router.post(
  "/organizations/:organizationId/drivers",
  authenticate,
  requireOrganizationAdmin,
  addDriverController
);

// Listar os motoristas vinculados à prefeitura
router.get(
  "/organizations/:organizationId/drivers",
  authenticate,
  requireOrganizationAdmin,
  listDriversController
);

export default router;
