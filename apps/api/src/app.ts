import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { registerErrorHandling } from "./errors/error-handler.js";
import { registerRoutes } from "./routes/index.js";
import { healthRoutes } from "./routes/health.js";

export function createApp() {
  void env;

  const app = Fastify({
    logger: true,
  });

  registerErrorHandling(app);

  app.register(helmet);

  app.register(cors, {
    origin: false,
  });

  app.register(healthRoutes);
  app.register(registerRoutes);

  return app;
}