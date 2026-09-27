import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateFareInput,
  UpdateFareInput,
} from "./fare.types.js";

export async function listFares() {
  return prisma.fare.findMany({
    include: {
      pool: true,
      user: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getFareById(id: string) {
  return prisma.fare.findUnique({
    where: { id },
    include: {
      pool: true,
      user: true,
    },
  });
}

export async function createFare(input: CreateFareInput) {
  const [pool, user] = await Promise.all([
    prisma.pool.findUnique({
      where: { id: input.poolId },
    }),
    prisma.user.findUnique({
      where: { id: input.userId },
    }),
  ]);

  if (!pool) {
    throw new Error("Pool not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  return prisma.fare.create({
    data: {
      poolId: input.poolId,
      userId: input.userId,
      amount: input.amount,
      calculationData:
        input.calculationData as Prisma.InputJsonValue,
    },
    include: {
      pool: true,
      user: true,
    },
  });
}

export async function updateFare(
  id: string,
  input: UpdateFareInput,
) {
  const existing = await prisma.fare.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Fare not found");
  }

  const data = {
    ...(input.amount !== undefined
      ? { amount: input.amount }
      : {}),
    ...(input.calculationData !== undefined
      ? {
          calculationData:
            input.calculationData as Prisma.InputJsonValue,
        }
      : {}),
  };

  return prisma.fare.update({
    where: { id },
    data,
    include: {
      pool: true,
      user: true,
    },
  });
}

export async function deleteFare(id: string) {
  const existing = await prisma.fare.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Fare not found");
  }

  return prisma.fare.delete({
    where: { id },
  });
}