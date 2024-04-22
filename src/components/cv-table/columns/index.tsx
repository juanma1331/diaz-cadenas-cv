import { type ColumnDef } from "@tanstack/react-table";

import nameColumnDef from "./columns-def/name";
import createdAtColumnDef from "./columns-def/created-at";
import { placeColumnDef } from "./columns-def/place";
import { positionColumnDef } from "./columns-def/position";
import { statusColumnDef } from "./columns-def/status";
import { attachmentsColumnDef } from "./columns-def/attachments";

import type { CVRow } from "./columns-def/types";

export function generateColumns(): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    nameColumnDef(),
    createdAtColumnDef(),
    placeColumnDef(),
    positionColumnDef(),
    statusColumnDef(),
    attachmentsColumnDef(),
  ];

  return columns;
}
