import { z } from "zod";

const languageSchema = z.enum(["en", "hi"]);

export const soilInputSchema = z.object({
  nitrogen: z.number().min(0).max(300),
  phosphorus: z.number().min(0).max(200),
  potassium: z.number().min(0).max(200),
  ph: z.number().min(0).max(14),
  landSize: z.number().min(0.1).max(10000),
  language: languageSchema.optional(),
});

export const weatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const marketQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export const scheduleQuerySchema = z.object({
  crop: z.string().min(2).max(40).optional(),
  language: languageSchema.optional(),
});

export const locationInputSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  language: languageSchema.optional(),
});

export const diseaseUploadSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string().startsWith("image/"),
    size: z.number().max(10 * 1024 * 1024),
    buffer: z.instanceof(Buffer),
  }),
  crop: z.string().min(2).max(80).optional(),
  language: languageSchema.optional(),
});

export const googleTokenSchema = z.object({
  idToken: z.string().min(50),
});

export const copilotChatSchema = z.object({
  language: languageSchema.optional(),
  context: z
    .object({
      profile: z
        .object({
          farmerName: z.string().optional(),
          village: z.string().optional(),
          primaryCrop: z.string().optional(),
          landSizeAcres: z.number().optional(),
        })
        .optional(),
      insights: z
        .object({
          soil: z.record(z.any()).nullable().optional(),
          disease: z.record(z.any()).nullable().optional(),
          location: z.record(z.any()).nullable().optional(),
        })
        .optional(),
    })
    .optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200),
      }),
    )
    .min(1)
    .max(20),
});

export const diseaseIngestionSchema = z.object({
  manifestPath: z.string().min(1).optional(),
  dryRun: z.boolean().optional(),
});

export const diseaseModelVersionSchema = z.object({
  id: z.string().min(2).max(100),
  stage: z.enum(["stable", "canary", "shadow"]).default("canary"),
  enabled: z.boolean().default(true),
  openAiVisionModel: z.string().min(2).max(120).optional(),
  providers: z.array(z.enum(["plant_id", "openai_vision"])).min(1).optional(),
  notes: z.string().max(500).optional(),
  metrics: z
    .object({
      top1: z.number().min(0).max(1).optional(),
      macroF1: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const diseaseModelRoutingSchema = z.object({
  stableVersionId: z.string().min(2).max(100).optional(),
  canaryVersionId: z.string().min(2).max(100).optional(),
  canaryPercent: z.number().min(0).max(1).optional(),
});

export const diseaseFeedbackSchema = z.object({
  diagnosisId: z.string().min(2).max(120).optional(),
  predictedLabel: z.string().min(2).max(150),
  correctedLabel: z.string().min(2).max(150).optional(),
  confidence: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  imageHash: z.string().min(8).max(128).optional(),
  language: languageSchema.optional(),
});

export const diseaseTrainJobSchema = z.object({
  requestedBy: z.string().min(2).max(80).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  trainerConfigPath: z.string().min(1).max(400).optional(),
  datasetManifestPath: z.string().min(1).max(400).optional(),
  targetVersionId: z.string().min(2).max(100).optional(),
  notes: z.string().max(2000).optional(),
  scheduleAt: z.string().datetime().optional(),
});

export const diseaseTrainJobStatusParamsSchema = z.object({
  jobId: z.string().uuid(),
});

export const diseaseTrainJobPatchSchema = z
  .object({
    status: z.enum(["queued", "running", "completed", "failed", "cancelled"]).optional(),
    heartbeat: z.boolean().optional(),
    progress: z.number().min(0).max(100).optional(),
    workerId: z.string().min(2).max(120).optional(),
    message: z.string().max(500).optional(),
    checkpointVersionId: z.string().min(2).max(120).optional(),
    metrics: z
      .object({
        trainLoss: z.number().optional(),
        valLoss: z.number().optional(),
        top1: z.number().min(0).max(1).optional(),
        macroF1: z.number().min(0).max(1).optional(),
      })
      .optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined
      || value.heartbeat !== undefined
      || value.progress !== undefined
      || value.workerId !== undefined
      || value.message !== undefined
      || value.checkpointVersionId !== undefined
      || value.metrics !== undefined,
    { message: "At least one patch field is required" },
  );

export const diseaseTrainWorkerTickSchema = z.object({
  workerId: z.string().min(2).max(120).optional(),
  progressStep: z.number().min(1).max(100).optional(),
  processAllRunning: z.boolean().optional(),
});
