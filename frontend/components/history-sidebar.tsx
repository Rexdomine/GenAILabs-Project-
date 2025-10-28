import { formatDistanceToNow } from "date-fns";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExperimentSummary } from "@/types/api";
import { cn } from "@/lib/utils";

const resolveTitle = (experiment: ExperimentSummary) => {
  const candidate = experiment.name?.trim();
  return candidate && candidate.length > 0 ? candidate : experiment.prompt;
};

type HistorySidebarProps = {
  experiments: ExperimentSummary[];
  isLoading?: boolean;
  activeExperimentId?: string;
  onSelect?(experimentId: string): void;
};

export function HistorySidebar({ experiments, isLoading, activeExperimentId, onSelect }: HistorySidebarProps) {
  const renderSkeletons = Array.from({ length: 3 }, (_, index) => (
    <div
      key={`skeleton-${index}`}
      className="h-[64px] w-full animate-pulse rounded-2xl border border-white/20 bg-white/20 dark:border-white/10 dark:bg-white/10"
    />
  ));

  return (
    <Card className="border-white/35 bg-white/45 dark:border-white/10 dark:bg-white/5">
      <CardHeader className="pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">Timeline</span>
        <CardTitle className="text-xl font-semibold">Recent experiments</CardTitle>
        <CardDescription className="text-sm">
          Chronological log of your latest parameter sweeps. Click to restore or branch a run.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && renderSkeletons}

        {!isLoading && experiments.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/40 bg-white/30 px-4 py-4 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/10">
            Once you run an experiment, it will appear here with model details and parameter snapshots.
          </p>
        )}

        {!isLoading && experiments.length > 0 && (
          <ScrollAreaPrimitive.Root className="max-h-[320px] overflow-hidden">
            <ScrollAreaPrimitive.Viewport className="pr-2">
              <div className="space-y-3">
                {experiments.map((experiment) => {
            const totalResponses = experiment.parameterSets.length * experiment.variations;
            const parameterSummary = `${experiment.parameterSets.length} parameter ${
              experiment.parameterSets.length === 1 ? "set" : "sets"
            }`;
            const timeAgo = formatDistanceToNow(new Date(experiment.createdAt), { addSuffix: true });

            return (
              <button
                key={experiment.id}
                type="button"
                onClick={() => onSelect?.(experiment.id)}
                className={cn(
                  "group w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 hover:-translate-y-[2px] hover:border-white/60 hover:bg-white/50 hover:shadow-[0_18px_45px_-28px_rgba(31,38,135,0.5)] dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:shadow-[0_18px_45px_-28px_rgba(4,10,35,0.55)]",
                  activeExperimentId === experiment.id
                    ? "border-white/70 bg-white/55 shadow-[0_18px_45px_-28px_rgba(31,38,135,0.5)] dark:border-white/20 dark:bg-white/10 dark:shadow-[0_18px_45px_-28px_rgba(4,10,35,0.55)]"
                    : "border-white/30 bg-white/30 dark:border-white/10 dark:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{resolveTitle(experiment)}</p>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70 opacity-0 transition-opacity group-hover:opacity-100">
                    restore
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{parameterSummary}</span>
                  <span className="text-primary/60">•</span>
                  <span>{totalResponses} responses</span>
                  <span className="text-primary/60">•</span>
                  <span>{timeAgo}</span>
                </div>
              </button>
            );
              })}
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="transition-colors hover:bg-white/30 dark:hover:bg-white/10">
              <ScrollAreaPrimitive.Thumb className="rounded-full bg-white/60 dark:bg-white/20" />
            </ScrollAreaPrimitive.Scrollbar>
          </ScrollAreaPrimitive.Root>
        )}
      </CardContent>
    </Card>
  );
}
