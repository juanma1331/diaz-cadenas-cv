import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, Filtering } from "./types";
import { PositionFilteringColumnHeader } from "../headers/position-filtering-column-header";

export function positionColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "position",
    header: ({ table }) => {
      const { filtering } = table.options.meta!;
      return (
        <PositionFilteringColumnHeader
          filteringState={filtering.filteringState}
          onFilter={filtering.onFilteringChange}
          onClearFilter={filtering.onClearFilter}
        />
      );
    },
  };
}
