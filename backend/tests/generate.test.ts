import fs from "node:fs";
import path from "node:path";

import request from "supertest";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test-db.sqlite";

const testDbPath = path.resolve("test-db.sqlite");

const { app } = await import("../src/server.js");

describe("Experiment generation API", () => {
  beforeAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("generates responses for parameter grid and stores experiment", async () => {
    const response = await request(app)
      .post("/api/generate")
      .send({
        prompt: "Summarise the benefits of test-driven development.",
        parameters: {
          temperature: [0.3, 0.7],
          top_p: [0.8, 1],
        },
        n: 2,
      })
      .expect(200);

    expect(response.body.responses).toHaveLength(8);
    expect(response.body.parameterSets).toHaveLength(4);
    expect(response.body.metadata.usingLiveModel).toBe(false);

    const experimentsResponse = await request(app).get("/api/experiments").expect(200);
    expect(experimentsResponse.body.experiments.length).toBeGreaterThan(0);

    const experimentId = response.body.experimentId;
    const experimentDetail = await request(app).get(`/api/experiments/${experimentId}`).expect(200);
    expect(experimentDetail.body.experiment.responses).toHaveLength(8);
  });
});
