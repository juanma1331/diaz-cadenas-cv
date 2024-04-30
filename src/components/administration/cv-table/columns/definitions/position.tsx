import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import { PositionFilteringColumnHeader } from "../headers/position-filtering-column-header";

export function positionColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "position",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;
      return (
        <PositionFilteringColumnHeader
          filteringState={states.filteringState}
          onFilter={handlers.onFilter}
          onClearFilter={handlers.onClearFilter}
        />
      );
    },
  };
}
