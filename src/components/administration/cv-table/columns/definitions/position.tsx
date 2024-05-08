import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import SortingColumnHeader, {
  isDesc,
  isSorting,
} from "../headers/sorting-column-header";

export default function positionColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "position",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="position"
          title="Puesto"
          isDesc={isDesc(states.sortingState, "position")}
          isSorting={isSorting(states.sortingState, "position")}
          onSort={handlers.onSort}
          onCleanSort={handlers.onCleanSort}
        />
      );
    },
  };
}
