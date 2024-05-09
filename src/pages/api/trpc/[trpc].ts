import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { APIRoute } from "astro";
import { createContext } from "@/server/context";
import { appRouter } from "@/server/router";

export const ALL: APIRoute = ({ request, locals }) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: ({ req, resHeaders }) =>
      createContext({ req, resHeaders, locals }),
    onError: (error) => {
      console.error("trpc error", error);
    },
  });
};
