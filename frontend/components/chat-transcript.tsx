import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

import type { ExperimentResponse } from "@/types/api";

type ChatTranscriptProps = {
  prompt?: string;
  responses?: ExperimentResponse[];
  isLoading?: boolean;
};

export function ChatTranscript({ prompt, responses, isLoading }: ChatTranscriptProps) {
  const uniqueResponses = responses
    ? Array.from(
        responses.reduce((acc, response) => {
          acc.set(response.id, response);
          return acc;
        }, new Map<string, ExperimentResponse>())
      .values()
    )
    : [];
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [uniqueResponses.length, isLoading]);

  if (!prompt) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/40 bg-white/30 p-10 text-sm text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-white/5">
        Ask a question to start the experiment and watch responses flow in here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.article
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 rounded-3xl border border-white/40 bg-white/45 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/25 text-sm font-semibold text-primary">
          You
        </div>
        <p className="text-sm leading-relaxed text-foreground">{prompt}</p>
      </motion.article>

      {isLoading && (
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-3xl border border-white/30 bg-white/35 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 font-semibold text-white">
            AI
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-primary">Running experiment…</span>
            <span>Sampling responses across parameter combinations and computing quality metrics.</span>
          </div>
        </motion.article>
      )}

      {uniqueResponses.map((response) => (
        <motion.article
          key={response.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-3xl border border-white/30 bg-white/40 p-4 backdrop-blur dark:border-white/10 dark:bg-white/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90 font-semibold uppercase text-white">
            AI
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary/70 dark:text-primary-foreground/85">
              <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 dark:border-white/20 dark:bg-white/10">
                temp {response.parameterSet.temperature.toFixed(2)}
              </span>
              <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 dark:border-white/20 dark:bg-white/10">
                top_p {response.parameterSet.topP.toFixed(2)}
              </span>
              <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 dark:border-white/20 dark:bg-white/10">
                variation {response.variationIndex + 1}
              </span>
              <span className="rounded-full border border-white/40 bg-white/60 px-3 py-1 dark:border-white/20 dark:bg-white/10">
                score {(response.metrics.score * 100).toFixed(0)}
              </span>
            </div>
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground">
              <ReactMarkdown>{response.response}</ReactMarkdown>
            </div>
          </div>
        </motion.article>
      ))}
      <div ref={endRef} className="h-24" />
    </div>
  );
}
