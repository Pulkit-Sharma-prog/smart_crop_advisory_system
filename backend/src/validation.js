import { z } from "zod";

export const soilInputSchema = z.object({
  nitrogen: z.number().min(0).max(300),
  phosphorus: z.number().min(0).max(200),
  potassium: z.number().min(0).max(200),
  ph: z.number().min(0).max(14),
  landSize: z.number().min(0.1).max(10000),
});

export const diseaseUploadSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string().startsWith("image/"),
    size: z.number().max(10 * 1024 * 1024),
  }),
});
