"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { initMonitoring } from "@/lib/monitoring";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    initMonitoring();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
