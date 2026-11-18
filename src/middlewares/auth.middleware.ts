
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(
      new AppError("Token de autenticação não informado.", 401)
    );
  }

  const token = authorization.slice(7);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(new Error("JWT_SECRET não configurado."));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      !Number.isSafeInteger(Number(decoded.sub)) ||
      Number(decoded.sub) <= 0
    ) {
      throw new AppError("Token inválido.", 401);
    }

    const payload = decoded as JwtPayload;

    res.locals.userId = Number(payload.sub);

    next();
  } catch {
    next(new AppError("Token inválido ou expirado.", 401));
  }
}
