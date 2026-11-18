
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

export async function requireAdmin(
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
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 401);
    }

    if (user.role !== "ADMIN") {
      throw new AppError(
        "Acesso permitido apenas para administradores.",
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
