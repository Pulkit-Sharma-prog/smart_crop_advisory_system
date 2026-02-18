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
import { getCopilotReply } from "./copilotService.js";
import { backendEnv } from "./env.js";
import { GoogleAuthError, verifyGoogleIdToken } from "./googleAuth.js";
import { ingestDatasetManifest, getDatasetManifestInfo } from "./ml/datasetIngestion.js";
import { readCheckpointRegistry, updateRoutingConfig, upsertCheckpointVersion } from "./ml/checkpointRegistry.js";
import { storeDiseaseFeedback } from "./ml/feedbackStore.js";
import { createTrainingJob, getTrainingJobById, listTrainingJobs, patchTrainingJob, tickTrainingWorker } from "./ml/trainingJobs.js";
import {
  copilotChatSchema,
  diseaseUploadSchema,
  diseaseFeedbackSchema,
  diseaseIngestionSchema,
  diseaseModelRoutingSchema,
  diseaseModelVersionSchema,
  diseaseTrainJobSchema,
  diseaseTrainJobPatchSchema,
  diseaseTrainWorkerTickSchema,
  diseaseTrainJobStatusParamsSchema,
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
          || backendEnv.frontendOrigins.includes("*")
          || backendEnv.frontendOrigins.includes(origin)
        ) {
          callback(null, true);
          return;
        }
        // Do not throw 500 for unknown origins. Browsers will block when CORS
        // headers are absent, while server-to-server proxy calls continue to work.
        callback(null, false);
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

  app.get("/api/system/config-status", (_req, res) => {
    const hasOpenAi = Boolean(backendEnv.openaiApiKey?.trim());
    const hasPlantId = Boolean(backendEnv.plantIdApiKey?.trim());
    const hasMysqlUrl = Boolean(backendEnv.mysqlUrl?.trim());
    const hasMysqlParts = Boolean(
      backendEnv.mysqlHost?.trim()
      && backendEnv.mysqlUser?.trim()
      && backendEnv.mysqlDatabase?.trim(),
    );

    res.json({
      copilot: {
        llmReady: hasOpenAi,
        mode: hasOpenAi ? "llm" : "fallback",
      },
      diseaseAi: {
        plantIdReady: hasPlantId,
        openAiVisionReady: hasOpenAi,
        openSetEnabled: true,
        unknownThreshold: backendEnv.diseaseUnknownThreshold,
      },
      database: {
        mysqlReady: hasMysqlUrl || hasMysqlParts,
      },
    });
  });

  app.get("/api/disease/model/status", (_req, res) => {
    const hasOpenAi = Boolean(backendEnv.openaiApiKey?.trim());
    const hasPlantId = Boolean(backendEnv.plantIdApiKey?.trim());
    const providers = [
      { id: "plant_id", ready: hasPlantId },
      { id: "openai_vision", ready: hasOpenAi },
    ];
    res.json({
      pipelineVersion: "disease-pipeline-v1",
      contractVersion: "2026-02-18",
      mode: providers.filter((item) => item.ready).length > 1 ? "ensemble" : "single_or_fallback",
      supportsOpenSet: true,
      unknownThreshold: backendEnv.diseaseUnknownThreshold,
      lowQualityThreshold: backendEnv.diseaseLowQualityThreshold,
      providers,
    });
  });

  app.get("/api/disease/ml/checkpoints", async (_req, res, next) => {
    try {
      const registry = await readCheckpointRegistry();
      res.json(registry);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/disease/ml/checkpoints", async (req, res, next) => {
    try {
      const payload = diseaseModelVersionSchema.parse(req.body);
      const registry = await upsertCheckpointVersion(payload);
      res.status(201).json(registry);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/disease/ml/routing", async (req, res, next) => {
    try {
      const payload = diseaseModelRoutingSchema.parse(req.body);
      const registry = await updateRoutingConfig(payload);
      res.json(registry);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/disease/ml/datasets/manifest", async (_req, res, next) => {
    try {
      const info = await getDatasetManifestInfo();
      res.json(info);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/disease/ml/datasets/ingest", async (req, res, next) => {
    try {
      const payload = diseaseIngestionSchema.parse(req.body ?? {});
      const report = await ingestDatasetManifest(payload);
      res.status(202).json(report);
    } catch (error) {
      next(error);
    }
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

  app.post("/api/copilot/chat", async (req, res, next) => {
    try {
      const payload = copilotChatSchema.parse(req.body);
      const reply = await getCopilotReply(payload);
      res.json({ reply });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/disease/feedback", async (req, res, next) => {
    try {
      const payload = diseaseFeedbackSchema.parse(req.body);
      const stored = await storeDiseaseFeedback(payload);
      res.status(202).json(stored);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/disease/train/jobs", async (req, res, next) => {
    try {
      const payload = diseaseTrainJobSchema.parse(req.body ?? {});
      const job = await createTrainingJob(payload);
      res.status(202).json(job);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/disease/train/jobs", async (req, res, next) => {
    try {
      const limitRaw = Number(req.query?.limit);
      const limit = Number.isFinite(limitRaw) ? limitRaw : 50;
      const jobs = await listTrainingJobs(limit);
      res.json({ jobs });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/disease/train/jobs/:jobId", async (req, res, next) => {
    try {
      const { jobId } = diseaseTrainJobStatusParamsSchema.parse(req.params);
      const job = await getTrainingJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }
      return res.json(job);
    } catch (error) {
      next(error);
      return undefined;
    }
  });

  app.patch("/api/disease/train/jobs/:jobId", async (req, res, next) => {
    try {
      const { jobId } = diseaseTrainJobStatusParamsSchema.parse(req.params);
      const payload = diseaseTrainJobPatchSchema.parse(req.body ?? {});
      const job = await patchTrainingJob(jobId, payload);
      if (!job) {
        return res.status(404).json({ message: "Training job not found" });
      }
      return res.json(job);
    } catch (error) {
      if (error?.name === "Error" && typeof error.message === "string" && error.message.startsWith("Invalid status transition")) {
        return res.status(400).json({ message: error.message });
      }
      if (error?.name === "Error" && typeof error.message === "string" && error.message.startsWith("Cannot heartbeat terminal job")) {
        return res.status(409).json({ message: error.message });
      }
      next(error);
      return undefined;
    }
  });

  app.post("/api/disease/train/workers/tick", async (req, res, next) => {
    try {
      const payload = diseaseTrainWorkerTickSchema.parse(req.body ?? {});
      const tickResult = await tickTrainingWorker(payload);
      return res.json(tickResult);
    } catch (error) {
      next(error);
      return undefined;
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
