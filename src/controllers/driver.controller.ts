
import { Request, Response, NextFunction } from "express";
import {
  addDriverToOrganization,
  createDriver,
} from "../services/driver.service";
import { prisma } from "../lib/prisma";
import { OrganizationRole } from "../generated/prisma/client";
import AppError from "../utils/AppError";

// Vincular um motorista existente a uma prefeitura
export async function addDriverController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = res.locals.organizationId;
    const { userId } = req.body ?? {};

    if (
      !Number.isSafeInteger(organizationId) ||
      organizationId <= 0
    ) {
      throw new AppError(
        "Prefeitura não identificada ou acesso não autorizado.",
        403
      );
    }

    const membership = await addDriverToOrganization({
      userId,
      organizationId,
    });

    return res.status(201).json({
      message: "Motorista vinculado à prefeitura com sucesso.",
      membership,
    });
  } catch (error) {
    next(error);
  }
}

// Cadastrar um novo motorista na prefeitura
export async function createDriverController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = res.locals.organizationId;

    if (
      !Number.isSafeInteger(organizationId) ||
      organizationId <= 0
    ) {
      throw new AppError(
        "Prefeitura não identificada ou acesso não autorizado.",
        403
      );
    }

    const result = await createDriver(
      req.body,
      organizationId
    );

    return res.status(201).json({
      message: "Motorista cadastrado com sucesso.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// Listar os motoristas de uma prefeitura
export async function listDriversController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = res.locals.organizationId;

    if (
      !Number.isSafeInteger(organizationId) ||
      organizationId <= 0
    ) {
      throw new AppError(
        "Prefeitura não identificada ou acesso não autorizado.",
        403
      );
    }

    const memberships = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        role: OrganizationRole.DRIVER,
      },
      select: {
        userId: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    const drivers = memberships.map((membership) => ({
      ...membership.user,
      joinedAt: membership.joinedAt,
    }));

    return res.status(200).json({ drivers });
  } catch (error) {
    next(error);
  }
}
