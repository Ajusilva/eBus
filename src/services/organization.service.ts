
import {
  OrganizationType,
  OrganizationRole,
  OrganizationStatus,
} from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

interface CreateOrganizationInput {
  name?: string;
  type?: OrganizationType;
  requesterId?: number;
}

export async function createOrganization(
  input: CreateOrganizationInput
) {
  const { name, type, requesterId } = input ?? {};

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

  if (type !== OrganizationType.CITY_HALL) {
    throw new AppError(
      "O cadastro está disponível apenas para prefeituras.",
      400
    );
  }

  if (
    !Number.isSafeInteger(requesterId) ||
    !requesterId ||
    requesterId <= 0
  ) {
    throw new AppError(
      "Usuário solicitante inválido.",
      401
    );
  }

  const organization = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        
        where: { id: requesterId },
        select: { id: true },
      });


      const pendingMembership = await tx.organizationMember.findFirst({
        where: {
          userId: requesterId,
          role: OrganizationRole.ADMIN,
          organization: {
            type: OrganizationType.CITY_HALL,
            status: OrganizationStatus.PENDING,
          },
        },
      });

      if (pendingMembership) {
        throw new AppError(
          "Você já possui uma solicitação de prefeitura aguardando aprovação.",
          409
        );
      }

      const approvedMembership = await tx.organizationMember.findFirst({
        where: {
          userId: requesterId,
          role: OrganizationRole.ADMIN,
          organization: {
            type: OrganizationType.CITY_HALL,
            status: OrganizationStatus.APPROVED,
          },
        },
      });

      if (approvedMembership) {
        throw new AppError(
          "Você já é administrador de uma prefeitura aprovada.",
          409
        );
      }



      if (!user) {
        throw new AppError(
          "Usuário solicitante não encontrado.",
          401
        );
      }

      const newOrganization = await tx.organization.create({
        
        data: {
          name: name.trim(),
          type: OrganizationType.CITY_HALL,
          status: OrganizationStatus.PENDING,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: newOrganization.id,
          role: OrganizationRole.ADMIN,
        },
      });

      return newOrganization;
    }
  );

  return organization;
}
