
import { OrganizationType } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

interface CreateOrganizationInput {
  name?: string;
  type?: OrganizationType;
}

export async function createOrganization(
  input: CreateOrganizationInput
) {
  const { name, type } = input ?? {};

  if (!name?.trim() || !type) {
    throw new AppError(
      "Nome e tipo da organização são obrigatórios.",
      400
    );
  }

  if (!Object.values(OrganizationType).includes(type)) {
    throw new AppError(
      "Tipo de organização inválido.",
      400
    );
  }

  const organization = await prisma.organization.create({
    data: {
      name: name.trim(),
      type,
    },
  });

  return organization;
}
