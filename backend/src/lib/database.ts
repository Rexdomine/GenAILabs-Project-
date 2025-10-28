import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ExperimentRecord, GenerateResponseRecord, ParameterSet } from "../shared/schema.js";
import { env } from "../env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDatabasePath(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    return path.resolve(__dirname, "../../db.sqlite");
  }

  if (databaseUrl.startsWith("file:")) {
    const relativePath = databaseUrl.replace("file:", "");
    return path.resolve(__dirname, "../../", relativePath);
  }

  return databaseUrl;
}

const dbPath = resolveDatabasePath(env.DATABASE_URL);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT,
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    parameters TEXT NOT NULL,
    variations INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    experiment_id TEXT NOT NULL,
    temperature REAL NOT NULL,
    top_p REAL NOT NULL,
    variation INTEGER NOT NULL,
    content TEXT NOT NULL,
    metrics TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_responses_experiment ON responses (experiment_id);
`);

export type StoredExperiment = ExperimentRecord & {
  name: string | null;
  createdAt: Date;
};

export type StoredResponse = GenerateResponseRecord & {
  createdAt: Date;
};

export function saveExperiment(params: {
  experiment: Omit<ExperimentRecord, "responses" | "createdAt"> & { name?: string };
  responses: GenerateResponseRecord[];
}) {
  const { experiment, responses } = params;

  const insertExperiment = db.prepare(`
    INSERT INTO experiments (id, name, prompt, model, parameters, variations)
    VALUES (@id, @name, @prompt, @model, @parameters, @variations)
  `);

  const insertResponse = db.prepare(`
    INSERT INTO responses (id, experiment_id, temperature, top_p, variation, content, metrics)
    VALUES (@id, @experimentId, @temperature, @topP, @variation, @content, @metrics)
  `);

  const insertMany = db.transaction(() => {
    insertExperiment.run({
      id: experiment.id,
      name: experiment.name ?? `New Experiment ${new Date().toLocaleString()}`,
      prompt: experiment.prompt,
      model: experiment.model,
      parameters: JSON.stringify(experiment.parameterSets),
      variations: experiment.variations,
    });

    for (const response of responses) {
      insertResponse.run({
        id: response.id,
        experimentId: experiment.id,
        temperature: response.parameterSet.temperature,
        topP: response.parameterSet.topP,
        variation: response.variationIndex,
        content: response.response,
        metrics: JSON.stringify(response.metrics),
      });
    }
  });

  insertMany();
}

export function listExperiments(limit = 10): StoredExperiment[] {
  const statement = db.prepare(`
    SELECT id, name, prompt, model, parameters, variations, created_at as createdAt
    FROM experiments
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);

  const rows = statement.all(limit) as Array<{
    id: string;
    name: string | null;
    prompt: string;
    model: string;
    parameters: string;
    variations: number;
    createdAt: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    prompt: row.prompt,
    model: row.model,
    parameterSets: JSON.parse(row.parameters) as ParameterSet[],
    variations: row.variations,
    createdAt: new Date(row.createdAt),
  }));
}

export function getExperiment(id: string): (StoredExperiment & { responses: StoredResponse[] }) | null {
  const experimentRow = db.prepare(
    `SELECT id, name, prompt, model, parameters, variations, created_at as createdAt FROM experiments WHERE id = ?`
  ).get(id) as
    | {
        id: string;
        name: string | null;
        prompt: string;
        model: string;
        parameters: string;
        variations: number;
        createdAt: string;
      }
    | undefined;

  if (!experimentRow) {
    return null;
  }

  const responseRows = db
    .prepare(
      `SELECT id, experiment_id as experimentId, temperature, top_p as topP, variation as variationIndex, content, metrics, created_at as createdAt
       FROM responses
       WHERE experiment_id = ?
       ORDER BY datetime(created_at) ASC`
    )
    .all(id) as Array<{
      id: string;
      experimentId: string;
      temperature: number;
      topP: number;
      variationIndex: number;
      content: string;
      metrics: string;
      createdAt: string;
    }>;

  return {
    id: experimentRow.id,
    name: experimentRow.name,
    prompt: experimentRow.prompt,
    model: experimentRow.model,
    parameterSets: JSON.parse(experimentRow.parameters) as ParameterSet[],
    variations: experimentRow.variations,
    createdAt: new Date(experimentRow.createdAt),
    responses: responseRows.map((row) => ({
      id: row.id,
      experimentId: row.experimentId,
      parameterSet: {
        temperature: row.temperature,
        topP: row.topP,
        variations: experimentRow.variations,
      },
      variationIndex: row.variationIndex,
      response: row.content,
      metrics: JSON.parse(row.metrics),
      createdAt: new Date(row.createdAt),
    })),
  };
}

export function deleteExperiment(id: string) {
  db.prepare(`DELETE FROM experiments WHERE id = ?`).run(id);
}

export function updateExperiment(id: string, payload: { name: string }): StoredExperiment {
  const { name } = payload;
  console.log(`Updating experiment ${id} with name: ${name}`);
  const statement = db.prepare(`UPDATE experiments SET name = ? WHERE id = ?`);
  const result = statement.run(name, id);
  console.log(`Update result: ${JSON.stringify(result)}`);
  const updated = getExperiment(id);
  if (!updated) {
    throw new Error("Experiment not found after update");
  }
  const { responses, ...experiment } = updated;
  return experiment;
}