
import { Request, Response, NextFunction } from "express";
import { createOrganization } from "../services/organization.service";
import AppError from "../utils/AppError";

export async function createOrganizationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = res.locals.userId;

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new AppError(
        "É necessário estar autenticado para cadastrar uma prefeitura.",
        401
      );
    }

    const organization = await createOrganization({
      ...req.body,
      requesterId: userId,
    });

    return res.status(201).json({
      message: "Solicitação de cadastro enviada para aprovação.",
      organization,
    });
  } catch (error) {
    next(error);
  }
}
