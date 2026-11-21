
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import {
  OrganizationRole,
  Role,
} from "../generated/prisma/client";

// Dados para vincular um motorista existente
interface AddDriverInput {
  userId: number;
  organizationId: number;
}

// Vincular um motorista existente a uma prefeitura
export async function addDriverToOrganization({
  userId,
  organizationId,
}: AddDriverInput) {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError("ID do motorista inválido.", 400);
  }

  if (
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new AppError("ID da prefeitura inválido.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado.", 404);
  }

  if (user.role !== Role.DRIVER) {
    throw new AppError(
      "Este usuário não está cadastrado como motorista.",
      400
    );
  }

  const existingMembership =
    await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

  if (existingMembership) {
    throw new AppError(
      "Este usuário já pertence a esta prefeitura.",
      409
    );
  }

  try {
    const membership = await prisma.organizationMember.create({
      data: {
        userId,
        organizationId,
        role: OrganizationRole.DRIVER,
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
        joinedAt: true,
      },
    });

    return membership;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "Este motorista já pertence a esta prefeitura.",
        409
      );
    }

    throw error;
  }
}

// Dados para cadastrar um novo motorista
interface CreateDriverInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  cpf?: string;
}

// Cadastrar motorista e vinculá-lo à prefeitura
export async function createDriver(
  input: CreateDriverInput,
  organizationId: number
) {
  if (
    !Number.isSafeInteger(organizationId) ||
    organizationId <= 0
  ) {
    throw new AppError("ID da prefeitura inválido.", 400);
  }

  const { name, email, password, phone, cpf } = input ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new AppError(
      "Nome, e-mail e senha são obrigatórios.",
      400
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    return await prisma.$transaction(async (tx) => {
      // Criar usuário motorista
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          phone,
          cpf,
          role: Role.DRIVER,
        },
      });

      // Vincular motorista à prefeitura
      const membership = await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId,
          role: OrganizationRole.DRIVER,
        },
        select: {
          userId: true,
          organizationId: true,
          role: true,
          joinedAt: true,
        },
      });

      // Remover a senha da resposta
      const { password: _password, ...safeUser } = user;

      return {
        driver: safeUser,
        membership,
      };
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "E-mail ou CPF já cadastrado.",
        409
      );
    }

    throw error;
  }
}
