import { createTRPCReact } from "@trpc/react-query";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@/server/router";
import { APP_URL } from "@/constants";

const trpcReact = createTRPCReact<AppRouter>();

const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${APP_URL}/api/trpc`,
    }),
  ],
});

export { trpcReact, trpcAstro };
