import type { FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
}

export function requireAuthentication(
  request: AuthenticatedRequest,
): string {
  if (!request.userId) {
    throw new AppError(
      "Authentication required",
      401,
      "UNAUTHENTICATED",
    );
  }

  return request.userId;
}