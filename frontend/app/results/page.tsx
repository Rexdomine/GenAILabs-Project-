import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Experiment Results</h1>
        <p className="text-sm text-muted-foreground">
          This page will render the full response set, parameter breakdowns, and charts for the
          selected experiment.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Once the backend endpoints are wired up, this view will load data via TanStack Query and
            render tables and charts for review.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            We&apos;ll support quick filtering by parameter set, inline quality metric comparisons,
            and the ability to mark &quot;best&quot; responses.
          </p>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/">Back to Lab</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
