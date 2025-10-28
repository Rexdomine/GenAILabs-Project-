import type { Request, Response } from "express";

import { env } from "../env.js";
import { generateRequestSchema } from "../shared/schema.js";
import { buildParameterPairs, generateResponses } from "../lib/openai.js";
import { saveExperiment } from "../lib/database.js";
import { pseudoUuid } from "../lib/pseudo-uuid.js";

export async function generateHandler(req: Request, res: Response) {
  const parseResult = generateRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  try {
    console.log("Generating responses for prompt:", req.body.prompt);
    const inputs = parseResult.data;
    const parameterSets = buildParameterPairs(inputs.parameters, inputs.n);
    console.log(`Generating ${parameterSets.length} responses...`);
    const responses = await generateResponses(inputs);
    console.log(`Generated ${responses.length} responses. Saving experiment...`);

    const experimentId = pseudoUuid();
    const responsesWithExperiment = responses.map((response) => ({
      ...response,
      experimentId,
    }));

    console.log(`Saving experiment ${experimentId} to the database...`);
    saveExperiment({
      experiment: {
        id: experimentId,
        prompt: inputs.prompt,
        model: inputs.model ?? "gpt-4o-mini",
        parameterSets,
        variations: inputs.n,
      },
      responses: responsesWithExperiment,
    });
    console.log(`Experiment ${experimentId} saved successfully.`);

    return res.json({
      experimentId,
      prompt: inputs.prompt,
      parameterSets,
      responses: responsesWithExperiment,
      metadata: {
        total: responses.length,
        generatedAt: new Date().toISOString(),
        usingLiveModel: Boolean(env.OPENAI_API_KEY && env.NODE_ENV !== "test"),
      },
    });
  } catch (error) {
    console.error("Error generating responses", error);
    return res.status(500).json({ error: "Failed to generate responses" });
  }
}
