import type { Request, Response } from "express";
import { Router } from "express";

import { deleteExperiment, getExperiment, listExperiments, updateExperiment } from "../lib/database.js";

export const experimentsRouter = Router();

experimentsRouter.get("/", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const experiments = listExperiments(Number.isNaN(limit) ? 10 : limit);
  return res.json({ experiments });
});

experimentsRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const experiment = getExperiment(req.params.id);
  if (!experiment) {
    return res.status(404).json({ error: "Experiment not found" });
  }

  return res.json({ experiment });
});

export function exportExperimentHandler(req: Request<{ id: string }>, res: Response) {
  const experiment = getExperiment(req.params.id);
  if (!experiment) {
    return res.status(404).json({ error: "Experiment not found" });
  }

  return res.json({
    metadata: {
      id: experiment.id,
      prompt: experiment.prompt,
      model: experiment.model,
      generatedAt: experiment.createdAt.toISOString(),
    },
    responses: experiment.responses,
  });
}

experimentsRouter.post("/export/:id", (req: Request<{ id: string }>, res: Response) =>
  exportExperimentHandler(req, res)
);

experimentsRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  deleteExperiment(req.params.id);
  return res.status(204).send();
});

experimentsRouter.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const experiment = updateExperiment(req.params.id, { name });
    return res.json({ experiment });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    return res.status(500).json({ error: "Failed to update experiment" });
  }
});