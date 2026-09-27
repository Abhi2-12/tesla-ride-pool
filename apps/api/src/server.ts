import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

let isShuttingDown = false;

async function start(): Promise<void> {
  try {
    await app.listen({
      host: "127.0.0.1",
      port: 3000,
    });
  } catch (error) {
    app.log.error(error, "Failed to start server");

    await prisma.$disconnect();

    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  app.log.info({ signal }, "Shutdown signal received");

  try {
    await app.close();
    await prisma.$disconnect();

    app.log.info("Application shutdown complete");
    process.exit(0);
  } catch (error) {
    app.log.error(error, "Error during application shutdown");

    await prisma.$disconnect();

    process.exit(1);
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();