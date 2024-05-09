import { changeStatusProcedure } from "./routes/change-status";
import { deleteCVProcedure } from "./routes/delete-cv";
import { getAllCVSProcedure } from "./routes/get-all-cvs";
import { getDashboardDataProcedure } from "./routes/get-dashboard";
import { insertCVProdedure } from "./routes/insert-cv.route";
import { t } from "./utils";

export const appRouter = t.router({
  insertCV: insertCVProdedure,
  getAllCVS: getAllCVSProcedure,
  changeStatus: changeStatusProcedure,
  delete: deleteCVProcedure,
  getDashboard: getDashboardDataProcedure,
});

export type AppRouter = typeof appRouter;
