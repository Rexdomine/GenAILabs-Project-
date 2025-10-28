"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.experimentRecordSchema = exports.responseRecordSchema = exports.qualityMetricSchema = exports.generateRequestSchema = exports.parameterSetSchema = void 0;
const zod_1 = require("zod");
exports.parameterSetSchema = zod_1.z.object({
    temperature: zod_1.z.number().min(0).max(2),
    topP: zod_1.z.number().min(0).max(1),
    variations: zod_1.z.number().int().min(1).max(8),
});
exports.generateRequestSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1, "Prompt is required"),
    parameters: zod_1.z.object({
        temperature: zod_1.z.array(zod_1.z.number().min(0).max(2)).min(1),
        top_p: zod_1.z.array(zod_1.z.number().min(0).max(1)).min(1),
    }),
    n: zod_1.z.number().int().min(1).max(8).default(3),
});
exports.qualityMetricSchema = zod_1.z.object({
    coherence: zod_1.z.number(),
    completeness: zod_1.z.number(),
    redundancy: zod_1.z.number(),
    readability: zod_1.z.number().optional(),
    structure: zod_1.z.number().optional(),
    score: zod_1.z.number(),
});
exports.responseRecordSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    experimentId: zod_1.z.string().uuid().optional(),
    parameterSet: exports.parameterSetSchema,
    response: zod_1.z.string(),
    metrics: exports.qualityMetricSchema,
    createdAt: zod_1.z.coerce.date().optional(),
});
exports.experimentRecordSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    prompt: zod_1.z.string(),
    parameterSets: zod_1.z.array(exports.parameterSetSchema),
    model: zod_1.z.string(),
    responses: zod_1.z.array(exports.responseRecordSchema).optional(),
    createdAt: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=schema.js.map