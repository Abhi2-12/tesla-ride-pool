import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createMembershipSchema,
  membershipIdSchema,
  updateMembershipSchema,
} from "./membership.schema.js";
import {
  createMembership,
  deleteMembership,
  getMembershipById,
  listMemberships,
  updateMembership,
} from "./membership.service.js";

export async function membershipRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/memberships", async () => {
    return listMemberships();
  });

  app.get("/memberships/:id", async (request) => {
    const { id } = validate(
      membershipIdSchema,
      request.params,
    );

    return getMembershipById(id);
  });

  app.post("/memberships", async (request, reply) => {
    const input = validate(
      createMembershipSchema,
      request.body,
    );

    const membership = await createMembership(input);

    return reply.status(201).send(membership);
  });

  app.patch("/memberships/:id", async (request) => {
    const { id } = validate(
      membershipIdSchema,
      request.params,
    );

    const input = validate(
      updateMembershipSchema,
      request.body,
    );

    return updateMembership(id, input);
  });

  app.delete("/memberships/:id", async (request, reply) => {
    const { id } = validate(
      membershipIdSchema,
      request.params,
    );

    await deleteMembership(id);

    return reply.status(204).send();
  });
}
