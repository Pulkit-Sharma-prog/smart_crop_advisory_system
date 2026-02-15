import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("backend adapter", () => {
  it("serves health endpoint", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns soil recommendation", async () => {
    const response = await request(app).post("/api/recommendations/soil").send({
      nitrogen: 120,
      phosphorus: 60,
      potassium: 40,
      ph: 6.5,
      landSize: 5,
    });

    expect(response.status).toBe(200);
    expect(response.body.healthScore).toBeTypeOf("number");
    expect(response.body.crops.length).toBeGreaterThan(0);
  });

  it("rejects invalid soil recommendation payload", async () => {
    const response = await request(app).post("/api/recommendations/soil").send({
      nitrogen: -1,
      phosphorus: 60,
      potassium: 40,
      ph: 6.5,
      landSize: 5,
    });

    expect(response.status).toBe(400);
  });

  it("analyzes disease image and returns guidance payload", async () => {
    const response = await request(app)
      .post("/api/disease/analyze")
      .attach("file", Buffer.from("fake-image-content"), {
        filename: "tomato_leaf.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(200);
    expect(response.body.primary.name).toBeTypeOf("string");
    expect(response.body.guidance.preventiveMeasures.length).toBeGreaterThan(0);
    expect(response.body.guidance.curativeActions.length).toBeGreaterThan(0);
  });

  it("rejects empty google auth payload", async () => {
    const response = await request(app).post("/api/auth/google/verify").send({});
    expect(response.status).toBe(400);
  });
});
