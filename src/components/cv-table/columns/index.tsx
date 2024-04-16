import { type ColumnDef } from "@tanstack/react-table";

import nameColumnDef from "./columns-def/name";
import createdAtColumnDef from "./columns-def/created-at";
import { placeColumnDef } from "./columns-def/place";
import { positionColumnDef } from "./columns-def/position";
import { statusColumnDef } from "./columns-def/status";
import { attachmentsColumnDef } from "./columns-def/attachments";
import { actionsColumnDef } from "./columns-def/actions";

import type {
  Actions,
  BatchActions,
  CVRow,
  DateFiltering,
  Filtering,
  Sorting,
} from "./columns-def/types";
import { selectionRowColumnDef } from "./columns-def/selection";

export * from "./columns-def/types";

export type GenerateColumnsParams = {
  filtering: Filtering;
  dateFiltering: DateFiltering;
  sorting: Sorting;
  actions: Actions;
  batchActions: BatchActions;
  isActionColumnLoading: boolean;
};

export function generateColumns({
  filtering,
  dateFiltering,
  sorting,
  actions,
  batchActions,
  isActionColumnLoading,
}: GenerateColumnsParams): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    selectionRowColumnDef(),
    nameColumnDef({ sorting }),
    createdAtColumnDef({ dateFiltering }),
    placeColumnDef({ filtering }),
    positionColumnDef({ filtering }),
    statusColumnDef({ filtering }),
    attachmentsColumnDef(),
    actionsColumnDef({ actions, batchActions, isActionColumnLoading }),
  ];

  return columns;
}
