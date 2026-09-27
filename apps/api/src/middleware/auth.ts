import type { FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { AppError } from "../errors/app-error.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  userRole?: string;
  authUser?: AuthenticatedUser;
}

export async function getAuthenticatedUser(
  request: FastifyRequest,
): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: String(session.user.role ?? "user"),
  };
}

export async function requireAuthentication(
  request: FastifyRequest,
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new AppError(
      "Authentication required",
      401,
      "UNAUTHENTICATED",
    );
  }

  return user;
}

export async function requireRole(
  request: FastifyRequest,
  roles: readonly string[],
): Promise<AuthenticatedUser> {
  const user = await requireAuthentication(request);

  if (!roles.includes(user.role)) {
    throw new AppError(
      "You do not have permission to perform this action",
      403,
      "FORBIDDEN",
    );
  }

  return user;
}
