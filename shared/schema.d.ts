import { z } from "zod";
export declare const parameterSetSchema: any;
export declare const generateRequestSchema: any;
export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
export declare const qualityMetricSchema: any;
export declare const responseRecordSchema: any;
export declare const experimentRecordSchema: any;
export type ParameterSet = z.infer<typeof parameterSetSchema>;
export type GenerateResponseRecord = z.infer<typeof responseRecordSchema>;
export type ExperimentRecord = z.infer<typeof experimentRecordSchema>;
//# sourceMappingURL=schema.d.ts.map