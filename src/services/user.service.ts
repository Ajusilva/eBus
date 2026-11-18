
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

interface CreateUserInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  cpf?: string;
  role?: Role;
  registration?: string;
}

export async function createUser(input: CreateUserInput) {
  const {
    name,
    email,
    password,
    phone,
    cpf,
    role,
    registration,
  } = input ?? {};

  if (!name || !email || !password || !role) {
    throw new AppError(
      "Nome, e-mail, senha e tipo de usuário são obrigatórios.",
      400
    );
  }

  if (!Object.values(Role).includes(role)) {
    throw new AppError("Tipo de usuário inválido.", 400);
  }

  if (role === Role.STUDENT && !registration) {
    throw new AppError(
      "A matrícula é obrigatória para estudantes.",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        cpf,
        role,

        ...(role === Role.STUDENT
          ? {
              student: {
                create: {
                  registration: registration!,
                },
              },
            }
          : {}),
      },
      include: {
        student: true,
      },
    });

    const { password: _password, ...safeUser } = user;

    return safeUser;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "E-mail, CPF ou matrícula já cadastrados.",
        409
      );
    }

    throw error;
  }
}
