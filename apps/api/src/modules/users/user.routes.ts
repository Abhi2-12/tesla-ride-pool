import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from "./user.schema.js";
import {
  createUser,
  deleteUser,
  getUserById,
  listUsers,
  updateUser,
} from "./user.service.js";

export async function userRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/users", async () => {
    return listUsers();
  });

  app.get("/users/:id", async (request) => {
    const { id } = validate(userIdSchema, request.params);

    return getUserById(id);
  });

  app.post("/users", async (request, reply) => {
    const input = validate(createUserSchema, request.body);
    const user = await createUser(input);

    return reply.status(201).send(user);
  });

  app.patch("/users/:id", async (request) => {
    const { id } = validate(userIdSchema, request.params);
    const input = validate(updateUserSchema, request.body);

    return updateUser(id, input);
  });

  app.delete("/users/:id", async (request, reply) => {
    const { id } = validate(userIdSchema, request.params);

    await deleteUser(id);

    return reply.status(204).send();
  });
}
