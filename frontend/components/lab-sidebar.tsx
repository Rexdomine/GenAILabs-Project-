import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExperimentSummary } from "@/types/api";
import "./lab-sidebar.css";

const resolveTitle = (experiment: ExperimentSummary) => {
  const candidate = experiment.name?.trim();
  return candidate && candidate.length > 0 ? candidate : experiment.prompt;
};

type LabSidebarProps = {
  experiments: ExperimentSummary[];
  isLoading?: boolean;
  activeExperimentId?: string;
  onSelect?(experimentId: string): void;
  onNewExperiment?(): void;
  onUpdateExperiment(id: string, newName: string): void;
};

export function LabSidebar({ experiments, isLoading, activeExperimentId, onSelect, onNewExperiment, onUpdateExperiment }: LabSidebarProps) {
  const skeletons = Array.from({ length: 4 }, (_, index) => (
    <div
      key={`skeleton-${index}`}
      className="h-[72px] w-full animate-pulse rounded-2xl border border-white/20 bg-white/20 dark:border-white/10 dark:bg-white/10"
    />
  ));

  const [editingExperimentId, setEditingExperimentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleEditClick = (e: React.MouseEvent, experiment: ExperimentSummary) => {
    e.stopPropagation();
    setEditingExperimentId(experiment.id);
    setEditingValue(resolveTitle(experiment));
  };

  const handleSave = (experimentId: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setEditingExperimentId(null);
      const target = experiments.find((item) => item.id === experimentId);
      setEditingValue(target ? resolveTitle(target) : "");
      return;
    }
    onUpdateExperiment(experimentId, trimmed);
    setEditingExperimentId(null);
  };

  const handleCancel = () => {
    setEditingExperimentId(null);
  };

  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/25 bg-white/10 shadow-[0_22px_55px_-32px_rgba(55,51,135,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_22px_55px_-32px_rgba(8,12,40,0.65)]">
        <header className="space-y-2.5 p-5 pb-4">
            <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-primary dark:bg-white/20 dark:text-primary-foreground">
              GAL LAB
            </span>
            <h2 className="mt-2 text-lg font-semibold text-foreground">Experiments</h2>
            <p className="text-xs text-muted-foreground">
              Your recent explorations appear below. Select one to revisit insights or start fresh.
            </p>
            <Button className="w-full justify-center text-sm font-semibold" onClick={onNewExperiment}>
              + New experiment
            </Button>
        </header>

        <div className="flex items-center justify-between px-5 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          <span>Recent runs</span>
          <span>{experiments.length}</span>
        </div>
        <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] p-2">
          {isLoading && skeletons}

          {!isLoading && experiments.length === 0 && (
            <p className="border-dashed border-white/40 bg-transparent px-4 py-4 text-xs text-muted-foreground dark:border-white/10">
              Experiments you run will be saved here automatically for quick recall.
            </p>
          )}

          {!isLoading &&
            experiments.map((experiment) => {
              const totalResponses = experiment.parameterSets.length * experiment.variations;
              const isActive = activeExperimentId === experiment.id;
              const isEditing = editingExperimentId === experiment.id;
              const title = resolveTitle(experiment);

              if (isEditing) {
                return (
                  <div key={experiment.id} className="rounded-lg bg-white/20 p-2.5 dark:bg-white/10">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full rounded border-0 bg-transparent text-sm font-semibold text-foreground focus:ring-1 focus:ring-white/50 dark:focus:ring-white/20"
                      autoFocus
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                      <Button size="sm" onClick={() => handleSave(experiment.id)}>Save</Button>
                    </div>
                  </div>
                )
              }

              return (
                <motion.button
                  key={experiment.id}
                  type="button"
                  layout
                  onClick={() => onSelect?.(experiment.id)}
                  className={cn(
                    "liquid-glass-effect relative w-full rounded-lg px-4 py-2 text-left transition-all duration-300 group",
                    { active: isActive }
                  )}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{title}</p>
                      <Pencil
                        className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => handleEditClick(e, experiment)}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground">
                      {experiment.parameterSets.length} sets · {totalResponses} responses
                    </p>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-primary/70">
                        {formatDistanceToNow(new Date(experiment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
        </div>
      </div>
  );
}
