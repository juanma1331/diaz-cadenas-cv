// src/tanstack-table-augmentations.d.ts
import { RowData } from "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    filtering: Filtering;
    dateFiltering: DateFiltering;
    sorting: Sorting;
    actions: Actions;
    batchActions: BatchActions;
    isActionColumnLoading: boolean;
  }
}
