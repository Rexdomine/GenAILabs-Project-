import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExportCalloutProps = {
  experimentId?: string;
  isExporting?: boolean;
  onExport?(format: "json" | "csv"): void;
};

export function ExportCallout({ experimentId, isExporting, onExport }: ExportCalloutProps) {
  const hasExperiment = Boolean(experimentId);

  return (
    <Card className="border-white/35 bg-white/45 dark:border-white/10 dark:bg-white/5">
      <CardHeader className="pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">Share</span>
        <CardTitle className="text-xl font-semibold">Export &amp; collaboration</CardTitle>
        <CardDescription className="text-sm">
          Package responses, metrics, and parameter notes as JSON or CSV for downstream analysis or reporting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Exports include a provenance footer with timestamp, OpenAI model, and a checksum for response integrity—handy
          for reproducibility across teams.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onExport?.("json")}
            disabled={!hasExperiment || isExporting}
          >
            {isExporting ? "Preparing..." : "Download JSON"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onExport?.("csv")}
            disabled={!hasExperiment || isExporting}
          >
            {isExporting ? "Preparing..." : "Download CSV"}
          </Button>
          <Button variant="ghost" size="sm" type="button" disabled>
            Send to email
          </Button>
        </div>
        {!hasExperiment ? (
          <p className="rounded-2xl border border-dashed border-white/40 bg-white/30 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/10">
            Run an experiment to unlock exports. We&apos;ll surface the latest run here automatically.
          </p>
        ) : (
          <p className="rounded-2xl border border-white/30 bg-white/30 px-4 py-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/10">
            Exporting will fetch data from <code>/api/export/{experimentId}</code>.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
