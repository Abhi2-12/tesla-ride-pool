import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
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
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: true,
    },
  });

  if (!vehicle) {
    throw new AppError(
      "Vehicle not found",
      404,
      "VEHICLE_NOT_FOUND",
    );
  }

  return vehicle;
}

export async function createVehicle(input: CreateVehicleInput) {
  const owner = await prisma.user.findUnique({
    where: {
      id: input.ownerId,
    },
  });

  if (!owner) {
    throw new AppError(
      "Vehicle owner not found",
      404,
      "OWNER_NOT_FOUND",
    );
  }

  return prisma.vehicle.create({
    data: input,
  });
}

export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
) {
  await getVehicleById(id);

  return prisma.vehicle.update({
    where: { id },
    data: input,
  });
}

export async function deleteVehicle(id: string) {
  await getVehicleById(id);

  try {
    await prisma.vehicle.delete({
      where: { id },
    });
  } catch {
    throw new AppError(
      "Vehicle cannot be deleted because related pools exist",
      409,
      "VEHICLE_DELETE_CONFLICT",
    );
  }
}