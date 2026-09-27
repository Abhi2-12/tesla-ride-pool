import { prisma } from "../../lib/prisma.js";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "./vehicle.types.js";

export async function listVehicles() {
  return prisma.vehicle.findMany({
    include: {
      owner: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: true,
    },
  });
}

export async function createVehicle(input: CreateVehicleInput) {
  const owner = await prisma.user.findUnique({
    where: { id: input.ownerId },
  });

  if (!owner) {
    throw new Error("Owner not found");
  }

  return prisma.vehicle.create({
    data: {
      ownerId: input.ownerId,
      type: input.type,
      capacity: input.capacity,
    },
    include: {
      owner: true,
    },
  });
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
) {
  const existing = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  const data = {
    ...(input.type !== undefined
      ? { type: input.type }
      : {}),
    ...(input.capacity !== undefined
      ? { capacity: input.capacity }
      : {}),
  };

  return prisma.vehicle.update({
    where: { id },
    data,
    include: {
      owner: true,
    },
  });
}

export async function deleteVehicle(id: string) {
  const existing = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Vehicle not found");
  }

  try {
    return await prisma.vehicle.delete({
      where: { id },
    });
  } catch {
    throw new Error(
      "Vehicle cannot be deleted because it is referenced by another record",
    );
  }
}