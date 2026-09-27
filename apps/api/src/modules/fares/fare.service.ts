import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
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
  const fare = await prisma.fare.findUnique({
    where: { id },
    include: {
      pool: true,
      user: true,
    },
  });

  if (!fare) {
    throw new AppError(
      "Fare not found",
      404,
      "FARE_NOT_FOUND",
    );
  }

  return fare;
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
    throw new AppError(
      "Pool not found",
      404,
      "POOL_NOT_FOUND",
    );
  }

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND",
    );
  }

  return prisma.fare.create({
    data: {
      poolId: input.poolId,
      userId: input.userId,
      amount: input.amount,
      calculationData: input.calculationData,
    },
  });
}

export async function updateFare(
  id: string,
  input: UpdateFareInput,
) {
  await getFareById(id);

  return prisma.fare.update({
    where: { id },
    data: {
      amount: input.amount,
      calculationData: input.calculationData,
    },
  });
}

export async function deleteFare(id: string) {
  await getFareById(id);

  await prisma.fare.delete({
    where: { id },
  });
}