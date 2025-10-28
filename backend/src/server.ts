import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";

import { env } from "./env.js";
import { experimentsRouter, exportExperimentHandler } from "./routes/experiments.js";
import { generateHandler } from "./routes/generate.js";

const parseOrigins = (raw?: string) =>
  raw
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const allowlistedOrigins = parseOrigins(env.CORS_ORIGINS);

export const app = express();

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });

  app.use((req, _res, next) => {
    const scope = Sentry.getCurrentScope();
    scope?.setTag("method", req.method);
    scope?.setTag("path", req.path);
    next();
  });
}

app.use(
  cors({
    origin:
      env.NODE_ENV === "development"
        ? true
        : allowlistedOrigins && allowlistedOrigins.length > 0
        ? allowlistedOrigins
        : undefined,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    openaiKeyConfigured: Boolean(env.OPENAI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/generate", generateHandler);
app.use("/api/experiments", experimentsRouter);
app.post("/api/export/:id", exportExperimentHandler);

if (env.SENTRY_DSN) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    Sentry.captureException(error);
    res.status(500).json({ error: "Internal server error" });
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const port = env.PORT || 4000;

if (env.NODE_ENV !== "test") {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API ready on http://localhost:${port}`);
  });
}
