import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import SortingColumnHeader, {
  isDesc,
  isSorting,
} from "../headers/sorting-column-header";

export default function placeColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "place",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="place"
          title="Lugar"
          isDesc={isDesc(states.sortingState, "place")}
          isSorting={isSorting(states.sortingState, "place")}
          onSort={handlers.onSort}
          onCleanSort={handlers.onCleanSort}
        />
      );
    },
  };
}
