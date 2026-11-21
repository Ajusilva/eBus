
import { Request, Response, NextFunction } from "express";
import {
  OrganizationRole,
  OrganizationStatus,
  OrganizationType
} from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

export async function requireOrganizationAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = res.locals.userId;
    const organizationId = Number(req.params.organizationId);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    if (
      !Number.isSafeInteger(organizationId) ||
      organizationId <= 0
    ) {
      throw new AppError("ID da prefeitura inválido.", 400);
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      include: {
        organization: true
      }
    });

    if (
      !membership ||
      membership.role !== OrganizationRole.ADMIN ||
      membership.organization.type !== OrganizationType.CITY_HALL ||
      membership.organization.status !== OrganizationStatus.APPROVED
    ) {
      throw new AppError(
        "Você não tem permissão para administrar esta prefeitura.",
        403
      );
    }

    res.locals.organizationId = organizationId;

    next();
  } catch (error) {
    next(error);
  }
}
