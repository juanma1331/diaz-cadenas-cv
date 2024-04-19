import { trpcReact } from "@/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import CVTable from "./table";
import { Toaster } from "@/components/ui/sonner";
import { APP_URL } from "@/constants";

export default function CVTableIsland() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        httpBatchLink({
          url: `${APP_URL}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CVTable />
        <Toaster />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}
