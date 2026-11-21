
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";

interface CreateBusInput {
  plate?: string;
  capacity?: number;
  organizationId: number;
}

export async function createBus(input: CreateBusInput) {
  const { plate, capacity, organizationId } = input;

  if (typeof plate !== "string" || !plate.trim()) {
    throw new AppError("A placa do ônibus é obrigatória.", 400);
  }

  if (!Number.isSafeInteger(capacity) || capacity! <= 0) {
    throw new AppError(
      "A capacidade deve ser um número inteiro maior que zero.",
      400
    );
  }

  const normalizedPlate = plate.trim().toUpperCase();

  try {
    const bus = await prisma.bus.create({
      data: {
        plate: normalizedPlate,
        capacity: capacity!,
        organizationId
      }
    });

    return bus;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "Já existe um ônibus cadastrado com essa placa.",
        409
      );
    }

    throw error;
  }
}
