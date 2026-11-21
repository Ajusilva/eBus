
import { Request, Response, NextFunction } from "express";
import { createBus } from "../services/bus.service";
import AppError from "../utils/AppError";
import { prisma } from "../lib/prisma";

export async function createBusController(
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

    const { plate, capacity } = req.body ?? {};

    const bus = await createBus({
      plate,
      capacity,
      organizationId
    });

    return res.status(201).json({
      message: "Ônibus cadastrado com sucesso.",
      bus
    });
  } catch (error) {
    next(error);
  }
}

export async function listBusesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = res.locals.organizationId;

    const buses = await prisma.bus.findMany({
      where: { organizationId },
      orderBy: { id: "asc" },
    });

    return res.status(200).json({ buses });
  } catch (error) {
    next(error);
  }
}
