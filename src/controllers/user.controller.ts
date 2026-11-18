
import { Request, Response, NextFunction } from "express";
import { createUser } from "../services/user.service";
import AppError from "../utils/AppError";

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}


export async function registerUserController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { role } = req.body;

    if (role !== "STUDENT" && role !== "GUARDIAN") {
      throw new AppError(
        "O cadastro público permite apenas estudantes e responsáveis.",
        403
      );
    }

    const user = await createUser(req.body);

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
