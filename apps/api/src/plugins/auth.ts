import type { FastifyInstance } from "fastify";

export async function authPlugin(
  _app: FastifyInstance,
): Promise<void> {
  /*
   * Authentication integration is implemented in Phase 6.3.
   * This plugin is intentionally kept as the registration boundary
   * so authentication does not become coupled to individual routes.
   */
}