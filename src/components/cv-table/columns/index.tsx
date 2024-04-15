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
  CVRow,
  DateFiltering,
  Filtering,
  Sorting,
} from "./columns-def/types";

export * from "./columns-def/types";

export type GenerateColumnsParams = {
  filtering: Filtering;
  dateFiltering: DateFiltering;
  sorting: Sorting;
  actions: Actions;
};

export function generateColumns({
  filtering,
  dateFiltering,
  sorting,
  actions,
}: GenerateColumnsParams): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    nameColumnDef({ sorting }),
    createdAtColumnDef({ dateFiltering }),
    placeColumnDef({ filtering }),
    positionColumnDef({ filtering }),
    statusColumnDef({ filtering }),
    attachmentsColumnDef(),
    actionsColumnDef({ actions }),
  ];

  return columns;
}
