
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

interface LoginInput {
  email?: string;
  password?: string;
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input ?? {};

  if (!email || !password) {
    throw new AppError(
      "E-mail e senha são obrigatórios.",
      400
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401
    );
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  const token = jwt.sign(
    {
      role: user.role,
    },
    jwtSecret,
    {
      subject: String(user.id),
      expiresIn: "1h",
      algorithm: "HS256",
    }
  );

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
}
