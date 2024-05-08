import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/router";

const trpcReact = createTRPCReact<AppRouter>();

const url =
  import.meta.env.MODE === "development"
    ? "http://localhost:4321"
    : "https://your-app.com";

const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${url}/api/trpc`,
    }),
  ],
});

export { trpcReact, trpcAstro };
