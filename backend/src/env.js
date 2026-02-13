import "dotenv/config";

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const backendEnv = {
  port: toNumber(process.env.PORT, 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
};
