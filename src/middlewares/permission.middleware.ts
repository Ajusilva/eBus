
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

export function requirePermission(permissionName: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // 1. Recuperar o ID definido pelo middleware de autenticação
      const userId = res.locals.userId;

      if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new AppError("Usuário não autenticado.", 401);
      }

      // 2. Consultar o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado.", 401);
      }

      // 3. Verificar se o papel possui a permissão solicitada
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          role: {
            name: user.role,
          },
          permission: {
            name: permissionName,
          },
        },
      });

      // 4. Bloquear usuários sem a permissão necessária
      if (!rolePermission) {
        throw new AppError(
          "Você não tem permissão para realizar esta ação.",
          403
        );
      }

      // 5. Permitir a continuidade da requisição
      next();
    } catch (error) {
      next(error);
    }
  };
}
