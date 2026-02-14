import cors from "cors";
import express from "express";
import multer from "multer";
import {
  computeSoilRecommendation,
  marketPrices,
  schedule,
  weatherForecast,
  weatherSnapshot,
} from "./data.js";
import { diagnosePlantDisease } from "./diseaseService.js";
import { backendEnv } from "./env.js";
import { diseaseUploadSchema, soilInputSchema } from "./validation.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: backendEnv.frontendOrigin,
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

  app.get("/api/weather/snapshot", (_req, res) => {
    res.json(weatherSnapshot);
  });

  app.get("/api/weather/forecast", (_req, res) => {
    res.json(weatherForecast);
  });

  app.get("/api/market/prices", (_req, res) => {
    res.json(marketPrices);
  });

  app.get("/api/schedule", (_req, res) => {
    res.json(schedule);
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

  app.use((error, _req, res, _next) => {
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
