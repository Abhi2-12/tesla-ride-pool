import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "./user.types.js";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "USER_EMAIL_EXISTS",
    );
  }

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
    },
  });
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
) {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (input.email !== undefined && input.email !== existing.email) {
    const emailOwner = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (emailOwner && emailOwner.id !== id) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "USER_EMAIL_EXISTS",
      );
    }
  }

  const data = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
  };

  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string) {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch {
    throw new AppError(
      "User cannot be deleted because related records exist",
      409,
      "USER_HAS_RELATIONS",
    );
  }
}