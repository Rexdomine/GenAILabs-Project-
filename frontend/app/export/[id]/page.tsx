"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ExportPageProps = {
  params: {
    id: string;
  };
};

export default function ExportPage({ params }: ExportPageProps) {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Export Experiment</CardTitle>
          <CardDescription>
            Endpoint wiring coming soon. For now we show the call-to-action and copy preview for ID:
            <span className="ml-1 font-semibold">{params.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The export endpoint will generate a signed URL so you can download the raw responses,
            enriched metrics, and metadata. We&apos;ll support JSON and CSV outputs plus a human
            readable summary.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled>
              Download JSON
            </Button>
            <Button variant="outline" disabled>
              Download CSV
            </Button>
          </div>
          <Button variant="ghost" className="px-0" onClick={() => router.back()}>
            Back to previous page
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
