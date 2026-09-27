import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type {
  CreatePoolInput,
  UpdatePoolInput,
} from "./pool.types.js";

export async function listPools() {
  return prisma.pool.findMany({
    include: {
      vehicle: true,
      creator: true,
      memberships: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getPoolById(id: string) {
  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      vehicle: true,
      creator: true,
      memberships: true,
      history: true,
      fares: true,
    },
  });

  if (!pool) {
    throw new AppError("Pool not found", 404, "POOL_NOT_FOUND");
  }

  return pool;
}

export async function createPool(input: CreatePoolInput) {
  const [vehicle, creator] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: input.vehicleId },
    }),
    prisma.user.findUnique({
      where: { id: input.creatorId },
    }),
  ]);

  if (!vehicle) {
    throw new AppError(
      "Pool vehicle not found",
      404,
      "VEHICLE_NOT_FOUND",
    );
  }

  if (!creator) {
    throw new AppError(
      "Pool creator not found",
      404,
      "CREATOR_NOT_FOUND",
    );
  }

  if (input.capacity > vehicle.capacity) {
    throw new AppError(
      "Pool capacity cannot exceed vehicle capacity",
      400,
      "POOL_CAPACITY_EXCEEDED",
    );
  }

  return prisma.pool.create({
    data: input,
  });
}

export async function updatePool(
  id: string,
  input: UpdatePoolInput,
) {
  const pool = await getPoolById(id);

  if (
    input.capacity !== undefined &&
    input.capacity < pool.memberships.length
  ) {
    throw new AppError(
      "Pool capacity cannot be lower than current membership count",
      400,
      "POOL_CAPACITY_TOO_LOW",
    );
  }

  if (
    input.capacity !== undefined &&
    input.capacity > pool.vehicle.capacity
  ) {
    throw new AppError(
      "Pool capacity cannot exceed vehicle capacity",
      400,
      "POOL_CAPACITY_EXCEEDED",
    );
  }

  const updated = await prisma.pool.update({
    where: { id },
    data: input,
  });

  if (
    input.state !== undefined &&
    input.state !== pool.state
  ) {
    await prisma.rideHistory.create({
      data: {
        poolId: id,
        oldState: pool.state,
        newState: input.state,
        changedBy: pool.creatorId,
      },
    });
  }

  return updated;
}

export async function deletePool(id: string) {
  await getPoolById(id);

  await prisma.pool.delete({
    where: { id },
  });
}