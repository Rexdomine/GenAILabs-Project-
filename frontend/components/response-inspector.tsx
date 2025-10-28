import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ExperimentResponse, ParameterSet, GenerateExperimentResult } from "@/types/api";

import { downloadCsv, downloadJson } from "@/lib/export";

type ResponseInspectorProps = {
  prompt: string;
  responses?: ExperimentResponse[];
  parameterSets?: ParameterSet[];
  experimentId?: string;
  isLoading?: boolean;
};

export function ResponseInspector({ prompt, responses, parameterSets, experimentId, isLoading }: ResponseInspectorProps) {
  const grouped = groupResponsesByParameter(responses);
  const metricsSummary = aggregateMetrics(responses);

  if (!responses || responses.length === 0) {
    return (
      <Card className="h-full border-white/40 bg-white/30 p-5 backdrop-blur dark:border-white/10 dark:bg-white/10">
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Run an experiment to unlock response analytics and export options.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const exportPayload: GenerateExperimentResult = {
    experimentId: experimentId ?? "unsaved",
    prompt,
    parameterSets: parameterSets ?? [],
    responses,
    metadata: {
      total: responses.length,
      generatedAt: new Date().toISOString(),
      usingLiveModel: true,
    },
  };

  return (
    <Tabs defaultValue="insights" className="flex h-full flex-col">
      <TabsList className="mb-3 w-full justify-start rounded-full border border-white/30 bg-white/40 p-1 backdrop-blur dark:border-white/10 dark:bg-white/10">
        <TabsTrigger
          value="insights"
          className="rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] dark:text-primary-foreground/80 data-[state=active]:dark:text-primary-foreground"
        >
          Insights
        </TabsTrigger>
        <TabsTrigger
          value="share"
          className="rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] dark:text-primary-foreground/80 data-[state=active]:dark:text-primary-foreground"
        >
          Share
        </TabsTrigger>
      </TabsList>

      <TabsContent value="insights" className="m-0 flex-1">
        <Card className="flex h-full flex-col border-white/40 bg-white/30 backdrop-blur dark:border-white/10 dark:bg-white/10">
        <CardHeader className="gap-1.5">
          <CardTitle className="text-lg font-semibold">Experiment insights</CardTitle>
          <CardDescription className="text-xs dark:text-muted-foreground/90">
            {`Prompt: ${truncate(prompt, 60)}`}
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary/70">
            <span className="rounded-full border border-white/40 bg-white/55 px-3 py-1 dark:text-primary-foreground">
              {parameterSets?.length ?? 0} parameter {parameterSets && parameterSets.length === 1 ? "set" : "sets"}
            </span>
            <span className="rounded-full border border-white/40 bg-white/55 px-3 py-1 dark:text-primary-foreground">
              {responses.length} responses
            </span>
          </div>
        </CardHeader>
          <CardContent className="flex-1 space-y-3.5">
            {isLoading && (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={`metric-skeleton-${index}`}
                    className="h-16 w-full animate-pulse rounded-2xl bg-white/40 dark:bg-white/10"
                  />
                ))}
              </div>
            )}

            {!isLoading && metricsSummary && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="grid gap-3.5"
                >
                  <div className="rounded-2xl border border-white/40 bg-white/40 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-primary-foreground/80">
                      Metric footprint
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer>
                        <RadarChart data={createRadarData(metricsSummary)}>
                          <PolarGrid stroke="rgba(255,255,255,0.35)" radialLines />
                          <PolarAngleAxis dataKey="metric" stroke="rgba(40,40,60,0.7)" />
                          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 1]} />
                          <Radar dataKey="score" stroke="rgba(88,64,255,0.8)" fill="rgba(88,64,255,0.45)" strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/40 bg-white/40 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-primary-foreground/80">
                      Parameter stability
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer>
                        <LineChart data={createTrendData(grouped)}>
                          <CartesianGrid stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} width={40} />
                          <Tooltip content={<ScoreTooltip />} />
                          <Line type="monotone" dataKey="score" stroke="rgba(88,64,255,0.85)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricBar label="Coherence" description="Sentence transitions & topical alignment." value={metricsSummary.coherence} />
                  <MetricBar label="Completeness" description="Coverage of requested details." value={metricsSummary.completeness} />
                  <MetricBar label="Redundancy" description="Token repetition relative to length." value={metricsSummary.redundancy} invert />
                  {typeof metricsSummary.readability === "number" && (
                    <MetricBar label="Readability" description="Ease of reading." value={metricsSummary.readability} />
                  )}
                  {typeof metricsSummary.structure === "number" && (
                    <MetricBar label="Structure" description="Presence of intro/body/outro." value={metricsSummary.structure} />
                  )}
                  <MetricBar label="Overall" description="Average weighted score." value={metricsSummary.score} emphasise />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="share" className="m-0 flex-1">
        <Card className="flex h-full flex-col border-white/40 bg-white/30 backdrop-blur dark:border-white/10 dark:bg-white/10">
          <CardHeader className="gap-1.5">
            <CardTitle className="text-lg font-semibold">Share & export</CardTitle>
            <CardDescription className="text-xs">
              Download the structured experiment results for reporting or pass them to collaborators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-1.5">
              <p>Exports include the prompt, model parameters, raw responses, and computed metrics.</p>
              <p className="text-xs text-muted-foreground">
                Experiment ID: <span className="font-mono text-foreground">{experimentId}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="sm" type="button" onClick={() => downloadJson(exportPayload)}>
                Download JSON
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => downloadCsv(exportPayload)}>
                Download CSV
              </Button>
              <Button variant="ghost" size="sm" type="button" disabled>
                Send to email (coming soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

type GroupedResponse = {
  key: string;
  parameterSet: ParameterSet;
  responses: ExperimentResponse[];
  averageScore: number;
  standardDeviation: number;
};

function groupResponsesByParameter(responses?: ExperimentResponse[]): GroupedResponse[] {
  if (!responses || responses.length === 0) {
    return [];
  }

  const groups = new Map<string, GroupedResponse>();

  for (const response of responses) {
    const key = `${response.parameterSet.temperature}-${response.parameterSet.topP}`;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        key,
        parameterSet: response.parameterSet,
        responses: [response],
        averageScore: response.metrics.score,
        standardDeviation: 0,
      });
    } else {
      existing.responses.push(response);
    }
  }

  return Array.from(groups.values()).map((group) => {
    const scores = group.responses.map((item) => item.metrics.score);
    const averageScore = scores.reduce((acc, value) => acc + value, 0) / scores.length;
    const variance =
      scores.reduce((acc, value) => acc + Math.pow(value - averageScore, 2), 0) / Math.max(scores.length - 1, 1);
    const standardDeviation = Math.sqrt(variance);

    return {
      ...group,
      averageScore,
      standardDeviation,
    };
  });
}

type MetricsAggregate = {
  coherence: number;
  completeness: number;
  redundancy: number;
  readability?: number;
  structure?: number;
  score: number;
};

function aggregateMetrics(responses?: ExperimentResponse[]): MetricsAggregate | null {
  if (!responses || responses.length === 0) {
    return null;
  }

  const total = responses.length;
  const sum = responses.reduce(
    (acc, response) => {
      acc.coherence += response.metrics.coherence;
      acc.completeness += response.metrics.completeness;
      acc.redundancy += response.metrics.redundancy;
      acc.score += response.metrics.score;
      if (typeof response.metrics.readability === "number") {
        acc.readability = (acc.readability ?? 0) + response.metrics.readability;
      }
      if (typeof response.metrics.structure === "number") {
        acc.structure = (acc.structure ?? 0) + response.metrics.structure;
      }
      return acc;
    },
    { coherence: 0, completeness: 0, redundancy: 0, readability: 0, structure: 0, score: 0 }
  );

  return {
    coherence: +(sum.coherence / total).toFixed(2),
    completeness: +(sum.completeness / total).toFixed(2),
    redundancy: +(sum.redundancy / total).toFixed(2),
    readability: sum.readability ? +(sum.readability / total).toFixed(2) : undefined,
    structure: sum.structure ? +(sum.structure / total).toFixed(2) : undefined,
    score: +(sum.score / total).toFixed(2),
  };
}

type MetricBarProps = {
  label: string;
  description: string;
  value: number;
  invert?: boolean;
  emphasise?: boolean;
};

function MetricBar({ label, description, value, invert, emphasise }: MetricBarProps) {
  const percentage = Math.max(0, Math.min(100, invert ? (1 - value) * 100 : value * 100));

  return (
    <div className="space-y-2 rounded-2xl border border-white/40 bg-white/35 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={
              emphasise
                ? "text-sm font-semibold text-primary dark:text-primary-foreground"
                : "text-sm font-medium dark:text-primary-foreground/85"
            }
          >
            {label}
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground/90">{description}</p>
        </div>
        <span className="text-sm font-semibold text-primary dark:text-primary-foreground">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-white/40 bg-white/20 dark:border-white/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary/50 to-blue-400/60 transition-all duration-700 ease-out"
          style={{ width: `${Math.round(percentage)}%` }}
        />
      </div>
    </div>
  );
}

function createRadarData(metrics: MetricsAggregate) {
  return [
    { metric: "Coherence", score: metrics.coherence },
    { metric: "Completeness", score: metrics.completeness },
    { metric: "Redundancy", score: 1 - metrics.redundancy },
    ...(typeof metrics.readability === "number" ? [{ metric: "Readability", score: metrics.readability }] : []),
    ...(typeof metrics.structure === "number" ? [{ metric: "Structure", score: metrics.structure }] : []),
    { metric: "Overall", score: metrics.score },
  ];
}

function createTrendData(groups: ReturnType<typeof groupResponsesByParameter>) {
  return groups.map((group) => ({
    label: `${group.parameterSet.temperature.toFixed(2)} / ${group.parameterSet.topP.toFixed(2)}`,
    score: group.averageScore,
  }));
}

function ScoreTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-xs text-foreground shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/10">
      {(payload[0].value ?? 0).toFixed(2)} score
    </div>
  );
}

function truncate(value: string, max = 64) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}
