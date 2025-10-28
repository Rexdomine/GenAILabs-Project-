"use client";

import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { LabSidebar } from "@/components/lab-sidebar";
import { ChatTranscript } from "@/components/chat-transcript";
import { PromptForm, PromptFormState, DEFAULT_STATE as DEFAULT_PROMPT_STATE } from "@/components/prompt-form";
import { ResponseInspector } from "@/components/response-inspector";
import { fetchExperimentById, fetchExperiments, runExperiment, updateExperiment } from "@/lib/api";
import type { ExperimentResponse, ExperimentSummary, GenerateExperimentResult, ParameterSet } from "@/types/api";

type ResponseInspectorDrawerProps = {
  open: boolean;
  prompt: string;
  responses?: GenerateExperimentResult["responses"];
  parameterSets?: GenerateExperimentResult["parameterSets"];
  experimentId?: string;
  isLoading?: boolean;
  onClose(): void;
};

export default function HomePage() {
  const queryClient = useQueryClient();
  const [formSnapshot, setFormSnapshot] = useState<PromptFormState | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<GenerateExperimentResult | null>(null);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorExperiment, setInspectorExperiment] = useState<GenerateExperimentResult | null>(null);

  const experimentsQuery = useQuery({
    queryKey: ["experiments"],
    queryFn: () => fetchExperiments(),
    staleTime: 1000 * 60,
  });

  const experimentDetailsQuery = useQuery({
    queryKey: ["experiment", selectedExperimentId],
    queryFn: () => fetchExperimentById(selectedExperimentId!),
    enabled: Boolean(selectedExperimentId),
    staleTime: 1000 * 60,
  });

  const experimentDetail = experimentDetailsQuery.data?.experiment;
  const inspectorData = inspectorExperiment ?? activeExperiment;

  useEffect(() => {
    if (!experimentDetail) return;

    const normalized = normalizeExperiment(experimentDetail);
    setInspectorExperiment(normalized);

    const isNewExperiment = !activeExperiment || activeExperiment.experimentId !== normalized.experimentId;
    if (isNewExperiment) {
      const parameterArrays = extractParameterArrays(normalized.parameterSets);
      const variations = getVariationCount(normalized.parameterSets, normalized.responses.length);

      setActiveExperiment(normalized);
      setFormSnapshot({
        prompt: normalized.prompt,
        parameters: {
          temperature: parameterArrays.temperature,
          topP: parameterArrays.topP,
          variations,
        },
      });
    }
  }, [experimentDetail, activeExperiment]);

  useEffect(() => {
    if (experimentDetailsQuery.error) {
      const message =
        experimentDetailsQuery.error instanceof Error
          ? experimentDetailsQuery.error.message
          : "Failed to load experiment";
      setErrorMessage(message);
    }
  }, [experimentDetailsQuery.error]);

  const runExperimentMutation = useMutation({
    mutationFn: runExperiment,
    onMutate: () => {
      setErrorMessage(null);
    },
    onSuccess: (data) => {
      const parameterArrays = extractParameterArrays(data.parameterSets);
      const variations = getVariationCount(data.parameterSets, data.responses.length);
      setActiveExperiment(data);
      setInspectorExperiment(data);
      setSelectedExperimentId(data.experimentId);
      setFormSnapshot({
        prompt: data.prompt,
        parameters: {
          temperature: parameterArrays.temperature,
          topP: parameterArrays.topP,
          variations,
        },
      });
      queryClient.setQueryData(["experiment", data.experimentId], { experiment: data });
      queryClient.invalidateQueries({ queryKey: ["experiments"] }).catch(() => null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Experiment failed");
    },
    onSettled: () => {
      // no-op
    },
  });

  const updateExperimentMutation = useMutation({
    mutationFn: (vars: { id: string; newName: string }) => updateExperiment(vars.id, { name: vars.newName }),
    onSuccess: (data) => {
      queryClient.setQueryData(["experiments"], (old: ExperimentSummary[] | undefined) => {
        if (!old) return [];
        return old.map((exp) => (exp.id === data.id ? data : exp));
      });
      queryClient.invalidateQueries({ queryKey: ["experiment", selectedExperimentId] });
    },
  });

  const lastRunDescriptor = useMemo(() => {
    const iso = activeExperiment?.metadata.generatedAt ?? inspectorExperiment?.metadata.generatedAt ?? experimentsQuery.data?.[0]?.createdAt;
    if (!iso) return "Awaiting first run";
    return `Last run ${formatDistanceToNow(new Date(iso), { addSuffix: true })}`;
  }, [activeExperiment?.metadata.generatedAt, inspectorExperiment?.metadata.generatedAt, experimentsQuery.data]);

  const handleRunExperiment = async (state: PromptFormState) => {
    console.log("handleRunExperiment called with state:", state);
    setFormSnapshot(state);
    try {
      await runExperimentMutation.mutateAsync({
        prompt: state.prompt,
        parameters: {
          temperature: state.parameters.temperature,
          top_p: state.parameters.topP,
        },
        n: state.parameters.variations,
      });
    } catch (error) {
      // error handled via onError
      console.error("Experiment run failed", error);
    } finally {
      runExperimentMutation.reset();
    }
  };

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    if (activeExperiment?.experimentId !== id) {
      setActiveExperiment(null);
    }
  };

  const handleUpdateExperiment = (id: string, newName: string) => {
    updateExperimentMutation.mutate({ id, newName });
  };

  return (
    <main className="relative flex h-screen w-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-[#5865F2]/30 via-[#8B5CF6]/25 to-transparent blur-[180px] dark:from-[#312e81]/40 dark:via-[#4c1d95]/30 dark:to-transparent" />
        <div className="absolute bottom-[-25%] left-[-15%] h-[640px] w-[640px] rounded-full bg-gradient-to-tr from-[#38BDF8]/25 via-[#6366F1]/20 to-transparent blur-[200px] dark:from-[#0ea5e9]/25 dark:via-[#312e81]/25 dark:to-transparent" />
      </div>

      <aside className="hidden w-[320px] shrink-0 border-r border-white/10 p-6 dark:border-white/5 lg:flex">
        <LabSidebar
          experiments={experimentsQuery.data ?? []}
          isLoading={experimentsQuery.isFetching}
          activeExperimentId={activeExperiment?.experimentId}
          onSelect={handleSelectExperiment}
          onUpdateExperiment={handleUpdateExperiment}
          onNewExperiment={() => {
            setFormSnapshot({ ...DEFAULT_PROMPT_STATE });
            setActiveExperiment(null);
            setInspectorExperiment(null);
            setSelectedExperimentId(null);
            setInspectorOpen(false);
          }}
        />
      </aside>

      <section className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Experiment Lab
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary dark:border-white/10 dark:bg-white/10 dark:text-white/90">
              <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.65)]" />
              {lastRunDescriptor}
            </span>
          </div>
          {errorMessage ? (
            <span className="rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
              {errorMessage}
            </span>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-36 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <ChatTranscript
              prompt={formSnapshot?.prompt}
              responses={activeExperiment?.responses}
              isLoading={runExperimentMutation.isPending}
            />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-6">
          <div className="mx-auto max-w-5xl">
            <PromptForm
              defaultState={formSnapshot ?? undefined}
              onSubmit={handleRunExperiment}
              isSubmitting={runExperimentMutation.isPending}
              activeExperiment={activeExperiment}
              onInspect={() => {
                setInspectorOpen(true);
              }}
            />
          </div>
        </div>
      </section>

      <ResponseInspectorDrawer
        open={Boolean(inspectorData?.responses?.length) && inspectorOpen}
        prompt={inspectorData?.prompt ?? formSnapshot?.prompt ?? ""}
        responses={inspectorData?.responses}
        parameterSets={inspectorData?.parameterSets}
        experimentId={inspectorData?.experimentId}
        isLoading={experimentDetailsQuery.isFetching}
        onClose={() => {
          setInspectorOpen(false);
        }}
      />
    </main>
  );
}

type ExperimentDetail = GenerateExperimentResult | (ExperimentSummary & { responses: ExperimentResponse[] });

function normalizeExperiment(experiment: ExperimentDetail): GenerateExperimentResult {
  if ("experimentId" in experiment) {
    return experiment;
  }

  return {
    experimentId: experiment.id,
    prompt: experiment.prompt,
    parameterSets: experiment.parameterSets,
    responses: experiment.responses,
    metadata: {
      total: experiment.responses.length,
      generatedAt: experiment.createdAt,
      usingLiveModel: false,
    },
  };
}

function getVariationCount(parameterSets: ParameterSet[], totalResponses: number): number {
  const declared = parameterSets.find((set) => Number.isFinite(set.variations) && set.variations > 0)?.variations;
  if (declared && declared > 0) {
    return declared;
  }

  const combinations = parameterSets.length || 1;
  if (totalResponses > 0) {
    return Math.max(1, Math.round(totalResponses / combinations));
  }

  return 1;
}

function extractParameterArrays(parameterSets: ParameterSet[]) {
  const temperature = Array.from(new Set(parameterSets.map((set) => Number(set.temperature.toFixed(3))))).sort(
    (a, b) => a - b
  );
  const topP = Array.from(new Set(parameterSets.map((set) => Number(set.topP.toFixed(3))))).sort((a, b) => a - b);
  return {
    temperature: temperature.length > 0 ? temperature : [0.7],
    topP: topP.length > 0 ? topP : [0.9],
  };
}

function ResponseInspectorDrawer({
  open,
  prompt,
  responses,
  parameterSets,
  experimentId,
  isLoading,
  onClose,
}: ResponseInspectorDrawerProps) {
  return (
    <div className="pointer-events-none">
      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={open ? { x: 0, opacity: 1 } : { x: 500, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="pointer-events-auto fixed top-24 right-6 z-40 hidden h-[calc(100vh-190px)] w-[480px] flex-col rounded-[28px] border border-white/15 bg-white/12 shadow-[0_70px_160px_-120px_rgba(8,16,40,0.8)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-[0_70px_160px_-120px_rgba(4,8,20,0.9)] lg:flex"
      >
        <div className="flex-1 overflow-y-auto">
          <ResponseInspector
            prompt={prompt}
            responses={responses}
            parameterSets={parameterSets}
            experimentId={experimentId}
            isLoading={isLoading}
          />
        </div>
        <div className="border-t border-white/10 p-3 text-right dark:border-white/5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
