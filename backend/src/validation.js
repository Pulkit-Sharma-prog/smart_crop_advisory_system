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
