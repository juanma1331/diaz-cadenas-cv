import { trpcReact } from "@/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import CVForm from "./form";
import { APP_URL } from "@/constants";

export default function CVFormIsland() {
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
        <CVForm />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}
