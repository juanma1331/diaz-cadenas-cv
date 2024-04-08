import { changeStatusProcedure } from "./routes/change-status";
import { deleteCVProcedure } from "./routes/delete-cv";
import { getAllCVSServerProcedure } from "./routes/get-all-cvs.server";
import { getStorageInUseProcedure } from "./routes/get-used-storage";
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
  getAllCVS: getAllCVSServerProcedure,
  changeStatus: changeStatusProcedure,
  delete: deleteCVProcedure,
  storageInUse: getStorageInUseProcedure,
});

export type AppRouter = typeof appRouter;
