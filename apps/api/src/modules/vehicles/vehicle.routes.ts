import type { FastifyInstance } from "fastify";
import { validate } from "../../validation/validate.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdSchema,
} from "./vehicle.schema.js";
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  listVehicles,
  updateVehicle,
} from "./vehicle.service.js";

export async function vehicleRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.get("/vehicles", async () => {
    return listVehicles();
  });

  app.get("/vehicles/:id", async (request) => {
    const { id } = validate(vehicleIdSchema, request.params);

    return getVehicleById(id);
  });

  app.post("/vehicles", async (request, reply) => {
    const input = validate(createVehicleSchema, request.body);
    const vehicle = await createVehicle(input);

    return reply.status(201).send(vehicle);
  });

  app.patch("/vehicles/:id", async (request) => {
    const { id } = validate(vehicleIdSchema, request.params);
    const input = validate(updateVehicleSchema, request.body);

    return updateVehicle(id, input);
  });

  app.delete("/vehicles/:id", async (request, reply) => {
    const { id } = validate(vehicleIdSchema, request.params);

    await deleteVehicle(id);

    return reply.status(204).send();
  });
}