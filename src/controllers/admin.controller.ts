
import { Request, Response, NextFunction } from "express";
import { reviewOrganization } from "../services/admin.service";
import AppError from "../utils/AppError";

export async function reviewOrganizationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = Number(req.params.id);
    const { decision } = req.body ?? {};

    if (
      !Number.isSafeInteger(organizationId) ||
      organizationId <= 0
    ) {
      throw new AppError("ID da prefeitura inválido.", 400);
    }

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      throw new AppError(
        "A decisão deve ser APPROVED ou REJECTED.",
        400
      );
    }

    const organization = await reviewOrganization(
      organizationId,
      decision
    );

    return res.status(200).json({
      message:
        decision === "APPROVED"
          ? "Prefeitura aprovada com sucesso."
          : "Solicitação de prefeitura rejeitada.",
      organization
    });
  } catch (error) {
    next(error);
  }
}
