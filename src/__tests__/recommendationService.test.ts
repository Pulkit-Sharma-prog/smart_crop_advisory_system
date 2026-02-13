import { describe, expect, it, vi } from "vitest";
import { getSoilRecommendation } from "../services/recommendationService";

describe("recommendationService", () => {
  it("computes deterministic mock recommendation when mock mode is enabled", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const response = await getSoilRecommendation({
      nitrogen: 120,
      phosphorus: 60,
      potassium: 40,
      ph: 6.5,
      landSize: 5,
    });

    expect(response.healthScore).toBeGreaterThanOrEqual(45);
    expect(response.crops[0]?.name).toBe("Wheat");
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
