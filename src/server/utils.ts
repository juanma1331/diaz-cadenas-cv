import {
  initTRPC,
  type inferRouterInputs,
  type inferRouterOutputs,
  TRPCError,
} from "@trpc/server";
import type { Context } from "./context";
import type { AppRouter } from "./router";

export const t = initTRPC.context<Context>().create({
  isServer: true,
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOuputs = inferRouterOutputs<AppRouter>;

export const middleware = t.middleware;

const isAdmin = middleware(async ({ ctx, next }) => {
  const locals = ctx.locals;

  if (!locals.user || !locals.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      locals: {
        user: locals.user,
        session: locals.session,
      },
    },
  });
});

export const publicProcedure = t.procedure;
export const adminProcedure = publicProcedure.use(isAdmin);
