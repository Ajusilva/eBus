
import { Request, Response, NextFunction } from "express";
import { loginUser } from "../services/auth.service";

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { user, token } = await loginUser(req.body);

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}
