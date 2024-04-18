import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/router";

const trpcReact = createTRPCReact<AppRouter>();

const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "https://graceful-souffle-ef28e5.netlify.app/api/trpc",
    }),
  ],
});

export { trpcReact, trpcAstro };
