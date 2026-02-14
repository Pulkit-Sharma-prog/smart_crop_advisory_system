import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentFile = fileURLToPath(import.meta.url);
const backendRoot = path.resolve(path.dirname(currentFile), "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const backendEnv = {
  port: toNumber(process.env.PORT, 3000),
  frontendOrigins: (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  mysqlUrl: process.env.MYSQL_URL ?? "",
  mysqlHost: process.env.MYSQL_HOST ?? "localhost",
  mysqlPort: toNumber(process.env.MYSQL_PORT, 3306),
  mysqlUser: process.env.MYSQL_USER ?? "root",
  mysqlPassword: process.env.MYSQL_PASSWORD ?? "",
  mysqlDatabase: process.env.MYSQL_DATABASE ?? "smart_crop_db",
  mysqlPoolLimit: toNumber(process.env.MYSQL_POOL_LIMIT, 10),
  plantIdApiKey: process.env.PLANT_ID_API_KEY ?? "",
  plantIdEndpoint: process.env.PLANT_ID_ENDPOINT ?? "https://api.plant.id/v2/health_assessment",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiVisionEndpoint: process.env.OPENAI_VISION_ENDPOINT ?? "https://api.openai.com/v1/responses",
  openaiVisionModel: process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini",
};
