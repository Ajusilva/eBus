
import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = res.locals.userId;

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== Role.SUPER_ADMIN) {
      throw new AppError(
        "Acesso permitido apenas ao administrador geral.",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
