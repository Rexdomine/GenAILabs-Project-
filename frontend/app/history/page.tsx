import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PLACEHOLDER_HISTORY = [
  {
    id: "exp-2024-11-01",
    title: "Storytelling tone exploration",
    description: "Measured how sampling affects narrative voice in creative writing prompts.",
  },
  {
    id: "exp-2024-10-26",
    title: "Support FAQ rewrite",
    description: "Compared concise vs. verbose answers for customer support scenarios.",
  },
  {
    id: "exp-2024-10-19",
    title: "STEM tutoring assistant",
    description: "Explored ways to keep explanations technically accurate and approachable.",
  },
];

export default function HistoryPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Experiment History</h1>
        <p className="text-sm text-muted-foreground">
          All recorded experiments will appear here once persistence is connected. For now we show a
          curated example of the expected layout.
        </p>
      </header>

      <div className="grid gap-4">
        {PLACEHOLDER_HISTORY.map((experiment) => (
          <Card key={experiment.id}>
            <CardHeader>
              <CardTitle>{experiment.title}</CardTitle>
              <CardDescription>ID: {experiment.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{experiment.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button asChild variant="outline" className="w-fit">
        <Link href="/">Back to Lab</Link>
      </Button>
    </main>
  );
}
