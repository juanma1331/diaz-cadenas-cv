import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import { PlaceFilteringColumnHeader } from "../headers/place-filtering-column-header";

export function placeColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "place",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;
      return (
        <PlaceFilteringColumnHeader
          filteringState={states.filteringState}
          onFilter={handlers.onFilter}
          onClearFilter={handlers.onClearFilter}
        />
      );
    },
  };
}
