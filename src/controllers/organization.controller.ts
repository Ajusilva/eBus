
import { Request, Response, NextFunction } from "express";
import { createOrganization } from "../services/organization.service";

export async function createOrganizationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organization = await createOrganization(req.body);

    return res.status(201).json({
      message: "Organização cadastrada com sucesso.",
      organization,
    });
  } catch (error) {
    next(error);
  }
}
