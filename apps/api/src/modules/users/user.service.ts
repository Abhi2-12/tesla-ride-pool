import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../errors/app-error.js";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "./user.types.js";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
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
    where: {
      email: input.email,
    },
  });

  if (existing) {
    throw new AppError(
      "A user with this email already exists",
      409,
      "USER_EMAIL_EXISTS",
    );
  }

  return prisma.user.create({
    data: input,
  });
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
) {
  await getUserById(id);

  if (input.email !== undefined) {
    const existing = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (existing && existing.id !== id) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "USER_EMAIL_EXISTS",
      );
    }
  }

  return prisma.user.update({
    where: { id },
    data: input,
  });
}

export async function deleteUser(id: string) {
  await getUserById(id);

  try {
    await prisma.user.delete({
      where: { id },
    });
  } catch {
    throw new AppError(
      "User cannot be deleted because related records exist",
      409,
      "USER_DELETE_CONFLICT",
    );
  }
}