import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { swaggerSpec } from "../docs/swagger.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (env.corsOrigin.includes("*") || env.corsOrigin.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/", (_req, res) =>
  res.json({
    success: true,
    name: "MIS Metal Construction API",
    docs: "/api/docs",
    health: "/api/health",
  })
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
