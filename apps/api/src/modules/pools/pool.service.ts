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
    throw new AppError("Vehicle not found", 404, "VEHICLE_NOT_FOUND");
  }

  if (!creator) {
    throw new AppError("Creator not found", 404, "CREATOR_NOT_FOUND");
  }

  if (input.capacity > vehicle.capacity) {
    throw new AppError(
      "Pool capacity cannot exceed vehicle capacity",
      409,
      "POOL_CAPACITY_EXCEEDED",
    );
  }

  return prisma.pool.create({
    data: {
      vehicleId: input.vehicleId,
      creatorId: input.creatorId,
      capacity: input.capacity,
      state: input.state,
    },
    include: {
      vehicle: true,
      creator: true,
      memberships: true,
    },
  });
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ["MATCHED", "ACCEPTED", "CANCELLED"],
  OPEN: ["MATCHED", "ACCEPTED", "CANCELLED"],
  MATCHED: ["DRIVER_ARRIVED", "CANCELLED"],
  ACCEPTED: ["DRIVER_ARRIVED", "CANCELLED"],
  DRIVER_ARRIVED: ["STARTED", "CANCELLED"],
  STARTED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function validateStateTransition(current: string, next: string): void {
  if (current === next) return;
  const allowed = VALID_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Invalid state transition from '${current}' to '${next}'`,
      400,
      "INVALID_STATE_TRANSITION"
    );
  }
}

export async function updatePool(
  id: string,
  input: UpdatePoolInput,
) {
  const existing = await prisma.pool.findUnique({
    where: { id },
    include: {
      vehicle: true,
      memberships: true,
    },
  });

  if (!existing) {
    throw new AppError("Pool not found", 404, "POOL_NOT_FOUND");
  }

  if (input.state !== undefined && input.state !== existing.state) {
    validateStateTransition(existing.state, input.state);
  }

  if (
    input.capacity !== undefined &&
    input.capacity < existing.memberships.length
  ) {
    throw new AppError(
      "Pool capacity cannot be lower than current membership count",
      409,
      "POOL_CAPACITY_TOO_LOW",
    );
  }

  if (
    input.capacity !== undefined &&
    input.capacity > existing.vehicle.capacity
  ) {
    throw new AppError(
      "Pool capacity cannot exceed vehicle capacity",
      409,
      "POOL_CAPACITY_EXCEEDED",
    );
  }

  const data = {
    ...(input.capacity !== undefined
      ? { capacity: input.capacity }
      : {}),
    ...(input.state !== undefined
      ? { state: input.state }
      : {}),
  };

  const pool = await prisma.pool.update({
    where: { id },
    data,
    include: {
      vehicle: true,
      creator: true,
      memberships: true,
    },
  });

  if (
    input.state !== undefined &&
    input.state !== existing.state
  ) {
    await prisma.rideHistory.create({
      data: {
        poolId: id,
        oldState: existing.state,
        newState: input.state,
        changedBy: existing.creatorId,
      },
    });
  }

  return pool;
}

export async function deletePool(id: string) {
  const existing = await prisma.pool.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Pool not found", 404, "POOL_NOT_FOUND");
  }

  await prisma.pool.delete({
    where: { id },
  });
}