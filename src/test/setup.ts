import "@testing-library/jest-dom/vitest";
import { afterAll, vi } from "vitest";
import "../i18n/config";

vi.stubEnv("VITE_USE_MOCK_DATA", "true");
vi.stubEnv("VITE_ALLOW_API_FALLBACK", "true");

afterAll(() => {
  vi.unstubAllEnvs();
});
