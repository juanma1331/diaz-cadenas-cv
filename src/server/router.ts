import { getAllCVSClientProcedure } from "./routes/get-all-cvs.client";
import { getAllCVSServerProcedure } from "./routes/get-all-cvs.server";
import { insertCVProdedure } from "./routes/insert-cv.route";
import { t } from "./utils";

// const isAdmin = middleware(async ({ ctx, next }) => {
//   if (!ctx.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED" });
//   }
//   return next({
//     ctx: {
//       user: ctx.user,
//     },
//   });
// });

// export const adminProcedure = publicProcedure.use(isAdmin);

export const appRouter = t.router({
  insertCV: insertCVProdedure,
  getAllCVSClient: getAllCVSClientProcedure,
  getAllCVSServer: getAllCVSServerProcedure,
});

export type AppRouter = typeof appRouter;
