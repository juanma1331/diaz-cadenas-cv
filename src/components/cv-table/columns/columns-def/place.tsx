import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, Filtering } from "./types";
import { PlaceFilteringColumnHeader } from "../headers/place-filtering-column-header";

export function placeColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "place",
    header: ({ table }) => {
      const { filtering } = table.options.meta!;
      return (
        <PlaceFilteringColumnHeader
          filteringState={filtering.filteringState}
          onFilter={filtering.onFilteringChange}
          onClearFilter={filtering.onClearFilter}
        />
      );
    },
  };
}
