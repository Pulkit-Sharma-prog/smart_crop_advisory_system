import cors from "cors";
import express from "express";
import multer from "multer";
import {
  computeLocationAdvisory,
  computeSoilRecommendation,
  getMarketPricesForLocation,
  getScheduleForCrop,
  getWeatherForecastForLocation,
  getWeatherSnapshotForLocation,
} from "./data.js";
import { diagnosePlantDisease } from "./diseaseService.js";
import { backendEnv } from "./env.js";
import { GoogleAuthError, verifyGoogleIdToken } from "./googleAuth.js";
import {
  diseaseUploadSchema,
  googleTokenSchema,
  locationInputSchema,
  marketQuerySchema,
  scheduleQuerySchema,
  soilInputSchema,
  weatherQuerySchema,
} from "./validation.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (
          backendEnv.frontendOrigins.length === 0
          || backendEnv.frontendOrigins.includes(origin)
        ) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      },
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "smart-crop-backend-adapter",
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "smart-crop-backend-adapter",
    });
  });

  app.get("/api/weather/snapshot", async (req, res, next) => {
    try {
      const parsed = weatherQuerySchema.parse(req.query);
      const response = await getWeatherSnapshotForLocation(parsed.latitude, parsed.longitude);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/weather/forecast", async (req, res, next) => {
    try {
      const parsed = weatherQuerySchema.parse(req.query);
      const response = await getWeatherForecastForLocation(parsed.latitude, parsed.longitude);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/market/prices", (req, res, next) => {
    try {
      const parsed = marketQuerySchema.parse(req.query);
      const response = getMarketPricesForLocation(parsed.latitude, parsed.longitude);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/schedule", (req, res, next) => {
    try {
      const parsed = scheduleQuerySchema.parse(req.query);
      const response = getScheduleForCrop(parsed.crop, parsed.language);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/recommendations/soil", (req, res, next) => {
    try {
      const payload = soilInputSchema.parse(req.body);
      const response = computeSoilRecommendation(payload);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/recommendations/location", (req, res, next) => {
    try {
      const payload = locationInputSchema.parse(req.body);
      const response = computeLocationAdvisory(payload);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/disease/analyze", upload.single("file"), async (req, res, next) => {
    try {
      const parsed = diseaseUploadSchema.parse({
        file: req.file,
        crop: req.body?.crop,
        language: req.body?.language,
      });
      const result = await diagnosePlantDisease(parsed.file, {
        cropHint: parsed.crop,
        language: parsed.language,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/google/verify", async (req, res, next) => {
    try {
      const payload = googleTokenSchema.parse(req.body);
      const user = await verifyGoogleIdToken(payload.idToken);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof GoogleAuthError) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    if (error?.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        issues: error.issues,
      });
    }

    if (error?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Uploaded file is too large",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  });

  return app;
}
