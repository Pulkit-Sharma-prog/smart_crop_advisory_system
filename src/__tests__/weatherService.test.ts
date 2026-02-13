import { describe, expect, it, vi } from "vitest";
import { getForecast, getWeatherSnapshot } from "../services/weatherService";

describe("weatherService", () => {
  it("returns mock data in mock mode without issuing network requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const snapshot = await getWeatherSnapshot();
    const forecast = await getForecast();

    expect(snapshot.currentTempC).toBeTypeOf("number");
    expect(forecast.length).toBeGreaterThan(0);
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
