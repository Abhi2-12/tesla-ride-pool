import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { registerErrorHandling } from "./errors/error-handler.js";
import { authPlugin } from "./plugins/auth.js";
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
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  });

  app.register(healthRoutes);

  app.register(authPlugin);

  app.register(registerRoutes);

  return app;
}
