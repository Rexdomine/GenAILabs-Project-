import { z } from "zod";

export const parameterSetSchema = z.object({
  temperature: z.number().min(0).max(2),
  topP: z.number().min(0).max(1),
  variations: z.number().int().min(1).max(8),
});

export const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  parameters: z.object({
    temperature: z.array(z.number().min(0).max(2)).min(1),
    top_p: z.array(z.number().min(0).max(1)).min(1),
  }),
  n: z.number().int().min(1).max(8).default(3),
  model: z.string().min(1).default("gpt-4o-mini"),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;

export const qualityMetricSchema = z.object({
  coherence: z.number(),
  completeness: z.number(),
  redundancy: z.number(),
  readability: z.number().optional(),
  structure: z.number().optional(),
  score: z.number(),
});

export const responseRecordSchema = z.object({
  id: z.string().uuid().optional(),
  experimentId: z.string().uuid().optional(),
  parameterSet: parameterSetSchema,
  variationIndex: z.number().int().min(0).default(0),
  response: z.string(),
  metrics: qualityMetricSchema,
  createdAt: z.coerce.date().optional(),
});

export const experimentRecordSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().nullable().optional(),
  prompt: z.string(),
  parameterSets: z.array(parameterSetSchema),
  model: z.string(),
  variations: z.number().int().min(1).max(8),
  responses: z.array(responseRecordSchema).optional(),
  createdAt: z.coerce.date().optional(),
});

export type ParameterSet = z.infer<typeof parameterSetSchema>;
export type GenerateResponseRecord = z.infer<typeof responseRecordSchema>;
export type ExperimentRecord = z.infer<typeof experimentRecordSchema>;