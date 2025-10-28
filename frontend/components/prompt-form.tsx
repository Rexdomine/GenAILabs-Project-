import * as Popover from "@radix-ui/react-popover";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Gauge, Layers } from "lucide-react";
import { InspectButton } from "@/components/inspect-button";
import { GenerateExperimentResult } from "@/types/api";

export type ParameterConfig = {
  temperature: number[];
  topP: number[];
  variations: number;
};

export type PromptFormState = {
  prompt: string;
  parameters: ParameterConfig;
};

type PromptFormProps = {
  defaultState?: PromptFormState;
  isSubmitting?: boolean;
  activeExperiment: GenerateExperimentResult | null;
  onSubmit?(state: PromptFormState): void;
  onInspect?(): void;
};

export const DEFAULT_STATE: PromptFormState = {
  prompt: "",
  parameters: {
    temperature: [0.7],
    topP: [0.9],
    variations: 3,
  },
};

export function PromptForm({
  defaultState = DEFAULT_STATE,
  isSubmitting,
  activeExperiment,
  onSubmit,
  onInspect = () => {},
}: PromptFormProps) {
  const [state, setState] = useState<PromptFormState>(defaultState);
  const [samplingOpen, setSamplingOpen] = useState(false);
  const [variationOpen, setVariationOpen] = useState(false);
  const [temperatureDraft, setTemperatureDraft] = useState(() => formatNumberList(defaultState.parameters.temperature));
  const [topPDraft, setTopPDraft] = useState(() => formatNumberList(defaultState.parameters.topP));

  useEffect(() => {
    setState(defaultState);
    setTemperatureDraft(formatNumberList(defaultState.parameters.temperature));
    setTopPDraft(formatNumberList(defaultState.parameters.topP));
  }, [defaultState]);

  const temperatureValue = state.parameters.temperature[0] ?? 0.7;
  const topPValue = state.parameters.topP[0] ?? 0.9;

  const combinationSummary = useMemo(() => {
    const combinations = state.parameters.temperature.length * state.parameters.topP.length;
    return combinations === 1 ? "single" : `${combinations} combos`;
  }, [state.parameters.temperature.length, state.parameters.topP.length]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.prompt.trim()) return;
    onSubmit?.(state);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="relative overflow-hidden rounded-[24px] border-white/40 bg-white/35 p-4 shadow-[0_20px_60px_-50px_rgba(31,38,135,0.6)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10 dark:shadow-[0_20px_60px_-50px_rgba(8,12,40,0.75)]">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              id="prompt"
              placeholder="Ask anything to start the experiment…"
              value={state.prompt}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  prompt: event.target.value,
                }))
              }
              className="min-h-[120px] resize-none rounded-2xl border border-white/40 bg-white/70 p-5 pr-28 text-sm shadow-inner backdrop-blur focus:border-primary/60 focus-visible:ring-0 dark:border-white/10 dark:bg-white/10"
            />
            {activeExperiment && (
              <InspectButton
                onClick={onInspect}
                position="inside"
                className="absolute right-4 top-4"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <SamplingPopover
                open={samplingOpen}
                onOpenChange={setSamplingOpen}
                temperatureValue={temperatureValue}
                topPValue={topPValue}
                temperatureDraft={temperatureDraft}
                topPDraft={topPDraft}
                onTemperatureDraftChange={setTemperatureDraft}
                onTopPDraftChange={setTopPDraft}
                onApply={({ temperature, topP }) =>
                  setState((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      temperature,
                      topP,
                    },
                  }))
                }
              />
              <span className="rounded-full border border-white/40 bg-white/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary dark:border-white/20 dark:bg-white/15 dark:text-primary-foreground">
                {temperatureValue.toFixed(2)} · {topPValue.toFixed(2)}
              </span>

              <VariationPopover
                open={variationOpen}
                onOpenChange={setVariationOpen}
                variations={state.parameters.variations}
                combinationSummary={combinationSummary}
                onApply={(next) =>
                  setState((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      variations: next,
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={!state.prompt.trim() || isSubmitting}
              className="rounded-full px-6 shadow-[0_20px_45px_-28px_rgba(31,38,135,0.55)]"
            >
              {isSubmitting ? "Running…" : "Send"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

type SliderControlProps = {
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange(value: number[]): void;
};

function SliderControl({ label, description, min, max, step, value, onValueChange }: SliderControlProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/40 bg-white/45 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10">
      {label ? (
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span>{label}</span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-foreground dark:bg-white/10 dark:text-primary-foreground">
            {value[0]}
          </span>
        </div>
      ) : null}
      <Slider min={min} max={max} step={step} value={value} onValueChange={onValueChange} className="data-[state=active]:scale-[1.02]" />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type SamplingPopoverProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  temperatureValue: number;
  topPValue: number;
  temperatureDraft: string;
  topPDraft: string;
  onTemperatureDraftChange(value: string): void;
  onTopPDraftChange(value: string): void;
  onApply(values: { temperature: number[]; topP: number[] }): void;
};

function SamplingPopover({
  open,
  onOpenChange,
  temperatureValue,
  topPValue,
  temperatureDraft,
  topPDraft,
  onTemperatureDraftChange,
  onTopPDraftChange,
  onApply,
}: SamplingPopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary transition hover:border-white/60 hover:bg-white/70 dark:border-white/10 dark:bg-white/15 dark:text-primary-foreground dark:hover:border-white/20 dark:hover:bg-white/25"
        >
          <Gauge className="h-3.5 w-3.5 text-primary dark:text-white" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={12}
          className="z-50 w-[280px] rounded-3xl border border-white/40 bg-white/85 p-5 shadow-[0_30px_80px_-40px_rgba(31,38,135,0.65)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-[0_30px_80px_-40px_rgba(6,10,35,0.7)]"
        >
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">
                <span>Temperature</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-white/10 dark:text-primary-foreground">
                  {temperatureValue.toFixed(2)}
                </span>
              </div>
              <SliderControl
                label=""
                description="Controls randomness. Higher values produce more varied answers."
                min={0}
                max={2}
                step={0.05}
                value={[temperatureValue]}
                onValueChange={([value]) => {
                  const next = Number(value.toFixed(2));
                  onTemperatureDraftChange(next.toFixed(2));
                  onApply({
                    temperature: parseNumberList(next.toString(), 0, 2, 0.01),
                    topP: parseNumberList(topPDraft, 0, 1, 0.01),
                  });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">
                <span>Top P</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-white/10 dark:text-primary-foreground">
                  {topPValue.toFixed(2)}
                </span>
              </div>
              <SliderControl
                label=""
                description="Restricts sampling to the most likely tokens."
                min={0}
                max={1}
                step={0.05}
                value={[topPValue]}
                onValueChange={([value]) => {
                  const next = Number(value.toFixed(2));
                  onTopPDraftChange(next.toFixed(2));
                  onApply({
                    temperature: parseNumberList(temperatureDraft, 0, 2, 0.01),
                    topP: parseNumberList(next.toString(), 0, 1, 0.01),
                  });
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Fine-tune the sampling band with the sliders above. Grid values update automatically.
            </p>
          </div>
        <Popover.Arrow className="fill-white/60 dark:fill-white/10" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

type VariationPopoverProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  variations: number;
  combinationSummary: string;
  onApply(variations: number): void;
};

function VariationPopover({ open, onOpenChange, variations, combinationSummary, onApply }: VariationPopoverProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-primary transition hover:border-white/60 hover:bg-white/70 dark:border-white/10 dark:bg-white/15 dark:text-primary-foreground dark:hover:border-white/20 dark:hover:bg-white/25"
        >
          <Layers className="h-3.5 w-3.5 text-primary dark:text-white" />
          <span>
            v{variations} · {combinationSummary}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={12}
          className="z-50 w-[200px] rounded-3xl border border-white/40 bg-white/85 p-4 shadow-[0_25px_70px_-40px_rgba(31,38,135,0.6)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-[0_25px_70px_-40px_rgba(6,10,35,0.65)]"
        >
          <div className="space-y-2.5 text-xs text-muted-foreground">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">Variations per set</p>
            <Input
              type="number"
              min={1}
              max={8}
              value={variations}
              onChange={(event) => onApply(Math.max(1, Math.min(8, Number(event.target.value) || 1)))}
              className="h-10 rounded-xl border border-white/50 bg-white/70 text-center text-sm font-semibold tracking-wide focus-visible:ring-0 dark:border-white/10 dark:bg-white/10"
            />
            <p className="text-[11px] text-muted-foreground">
              Each parameter combination will be sampled this many times. Keep the count modest to avoid rate limits.
            </p>
          </div>
        <Popover.Arrow className="fill-white/60 dark:fill-white/10" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function formatNumberList(values: number[]) {
  return values.map((value) => Number(value.toFixed(3))).join(", ");
}

function parseNumberList(input: string, min: number, max: number, precision = 0.01) {
  const parsed = input
    .split(",")
    .map((token) => Number(token.trim()))
    .filter((value) => !Number.isNaN(value))
    .map((value) => clamp(Number(value.toFixed(3)), min, max));

  if (parsed.length === 0) {
    return [clamp(Number(input) || min, min, max)];
  }

  const unique = Array.from(new Set(parsed.map((value) => Number(value.toFixed(precision < 0.1 ? 3 : 2)))));
  return unique.sort((a, b) => a - b);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
