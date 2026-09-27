import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateRideHistoryInput } from "./ride-history.types.js";

export async function listRideHistory() {
  return prisma.rideHistory.findMany({
    orderBy: {
      changedAt: "desc",
    },
  });
}

export async function getRideHistoryByPool(
  poolId: string,
) {
  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
  });

  if (!pool) {
    throw new AppError(
      "Pool not found",
      404,
      "POOL_NOT_FOUND",
    );
  }

  return prisma.rideHistory.findMany({
    where: {
      poolId,
    },
    orderBy: {
      changedAt: "asc",
    },
  });
}

export async function createRideHistory(
  input: CreateRideHistoryInput,
) {
  const [pool, user] = await Promise.all([
    prisma.pool.findUnique({
      where: {
        id: input.poolId,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: input.changedBy,
      },
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
      "User who changed the state was not found",
      404,
      "CHANGED_BY_USER_NOT_FOUND",
    );
  }

  return prisma.rideHistory.create({
    data: input,
  });
}