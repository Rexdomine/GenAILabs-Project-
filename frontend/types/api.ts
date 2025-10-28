export type QualityMetrics = {
  coherence: number;
  completeness: number;
  redundancy: number;
  readability?: number;
  structure?: number;
  score: number;
};

export type ParameterSet = {
  temperature: number;
  topP: number;
  variations: number;
};

export type ExperimentResponse = {
  id: string;
  experimentId: string;
  parameterSet: ParameterSet;
  variationIndex: number;
  response: string;
  metrics: QualityMetrics;
  createdAt: string;
};

export type ExperimentSummary = {
  id: string;
  name?: string | null;
  prompt: string;
  model: string;
  parameterSets: ParameterSet[];
  variations: number;
  createdAt: string;
};

export type GenerateExperimentPayload = {
  prompt: string;
  parameters: {
    temperature: number[];
    top_p: number[];
  };
  n: number;
  model?: string;
};

export type GenerateExperimentResult = {
  experimentId: string;
  prompt: string;
  parameterSets: ParameterSet[];
  responses: ExperimentResponse[];
  metadata: {
    total: number;
    generatedAt: string;
    usingLiveModel: boolean;
  };
};
