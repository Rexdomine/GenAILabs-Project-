import type {
  ExperimentResponse,
  ExperimentSummary,
  GenerateExperimentPayload,
  GenerateExperimentResult,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error ?? response.statusText ?? "Request failed";
    throw new Error(message);
  }
  return response.json();
}

export async function runExperiment(payload: GenerateExperimentPayload): Promise<GenerateExperimentResult> {
  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function fetchExperiments(limit = 30): Promise<ExperimentSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/experiments?limit=${limit}`);
  const data = await handleResponse(response);
  return data.experiments as ExperimentSummary[];
}

export async function fetchExperimentById(id: string): Promise<{
  experiment: ExperimentSummary & { responses: ExperimentResponse[] };
}> {
  const response = await fetch(`${API_BASE_URL}/api/experiments/${id}`);
  return handleResponse(response);
}

export async function updateExperiment(id: string, payload: { name: string }): Promise<ExperimentSummary> {
  const response = await fetch(`${API_BASE_URL}/api/experiments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);
  return data.experiment as ExperimentSummary;
}
