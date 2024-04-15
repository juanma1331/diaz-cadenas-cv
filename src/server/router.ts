import { changeStatusProcedure } from "./routes/change-status";
import { deleteCVProcedure } from "./routes/delete-cv";
import { getAllCVSProcedure } from "./routes/get-all-cvs";
import { getStorageInUseProcedure } from "./routes/get-storage-in-use";
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
  getAllCVS: getAllCVSProcedure,
  changeStatus: changeStatusProcedure,
  delete: deleteCVProcedure,
  getStorageInUse: getStorageInUseProcedure,
});

export type AppRouter = typeof appRouter;
