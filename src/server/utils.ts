import {
  initTRPC,
  type inferRouterInputs,
  type inferRouterOutputs,
} from "@trpc/server";
import type { Context } from "./context";
import type { AppRouter } from "./router";

export const t = initTRPC.context<Context>().create({
  isServer: true,
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOuputs = inferRouterOutputs<AppRouter>;

export const middleware = t.middleware;
export const publicProcedure = t.procedure;
