import type { GenerateExperimentResult } from "@/types/api";

function triggerDownload(filename: string, content: BlobPart, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJson(experiment: GenerateExperimentResult) {
  const filename = `experiment-${experiment.experimentId}.json`;
  triggerDownload(filename, JSON.stringify(experiment, null, 2), "application/json");
}

export function downloadCsv(experiment: GenerateExperimentResult) {
  const header = [
    "experiment_id",
    "prompt",
    "temperature",
    "top_p",
    "variation_index",
    "coherence",
    "completeness",
    "redundancy",
    "readability",
    "structure",
    "score",
    "response",
  ];

  const rows = experiment.responses.map((response) => [
    experiment.experimentId,
    JSON.stringify(experiment.prompt),
    response.parameterSet.temperature.toFixed(2),
    response.parameterSet.topP.toFixed(2),
    response.variationIndex,
    response.metrics.coherence.toFixed(2),
    response.metrics.completeness.toFixed(2),
    response.metrics.redundancy.toFixed(2),
    response.metrics.readability !== undefined ? response.metrics.readability.toFixed(2) : "",
    response.metrics.structure !== undefined ? response.metrics.structure.toFixed(2) : "",
    response.metrics.score.toFixed(2),
    JSON.stringify(response.response),
  ]);

  const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const filename = `experiment-${experiment.experimentId}.csv`;
  triggerDownload(filename, csvContent, "text/csv");
}
