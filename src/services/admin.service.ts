
import { OrganizationStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

export async function reviewOrganization(
  organizationId: number,
  decision: "APPROVED" | "REJECTED"
) {
  if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
    throw new AppError("ID da prefeitura inválido.", 400);
  }

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new AppError("Decisão inválida.", 400);
  }

  const result = await prisma.organization.updateMany({
    where: {
      id: organizationId,
      type: "CITY_HALL",
      status: OrganizationStatus.PENDING
    },
    data: {
      status: decision
    }
  });

  if (result.count === 0) {
    throw new AppError(
      "Prefeitura não encontrada ou solicitação já analisada.",
      409
    );
  }

  return prisma.organization.findUniqueOrThrow({
    where: { id: organizationId }
  });
}
