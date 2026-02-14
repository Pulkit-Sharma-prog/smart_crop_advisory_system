import "dotenv/config";

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const backendEnv = {
  port: toNumber(process.env.PORT, 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  embeddedDbPath: process.env.EMBEDDED_DB_PATH ?? "storage/crop-advisory-db.json",
  plantIdApiKey: process.env.PLANT_ID_API_KEY ?? "",
  plantIdEndpoint: process.env.PLANT_ID_ENDPOINT ?? "https://api.plant.id/v2/health_assessment",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiVisionEndpoint: process.env.OPENAI_VISION_ENDPOINT ?? "https://api.openai.com/v1/responses",
  openaiVisionModel: process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini",
};
