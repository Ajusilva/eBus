
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireOrganizationAdmin } from "../middlewares/organizationAdmin.middleware";
import { createOrganizationController } from "../controllers/organization.controller";
import { prisma } from "../lib/prisma";

const router = Router();

// Solicitar o cadastro de uma prefeitura
router.post(
  "/organizations",
  authenticate,
  createOrganizationController
);

// Consultar uma prefeitura administrada pelo usuário
router.get(
  "/organizations/:organizationId",
  authenticate,
  requireOrganizationAdmin,
  async (req, res, next) => {
    try {
      const organizationId = res.locals.organizationId;

      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          createdAt: true
        }
      });

      return res.status(200).json({
        organization
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
