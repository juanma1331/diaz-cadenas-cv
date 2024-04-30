// src/tanstack-table-augmentations.d.ts
import type { RouterOuputs } from "@/server/utils";
import { RowData } from "@tanstack/table-core";
import type {
  Actions,
  Filtering,
  DateFiltering,
  Sorting,
  BatchActions,
  Handlers,
  States,
  Loading,
} from "@/components/administration/cv-table/types";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    handlers: Handlers;
    states: States;
    loading: Loading;
    tableData: RouterOuputs["getAllCVS"]["cvs"];
  }
}

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}
