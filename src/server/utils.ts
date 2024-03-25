import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  isServer: true,
});

export const middleware = t.middleware;
export const publicProcedure = t.procedure;
