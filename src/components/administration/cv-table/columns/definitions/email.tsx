import type { ColumnDef } from "@tanstack/react-table";
import SortingColumnHeader, {
  isDesc,
  isSorting,
} from "../headers/sorting-column-header";
import type { CVRow } from "../../types";

export default function emailColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "email",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="email"
          title="Email"
          isDesc={isDesc(states.sortingState, "email")}
          isSorting={isSorting(states.sortingState, "email")}
          onSort={handlers.onSort}
          onCleanSort={handlers.onCleanSort}
        />
      );
    },
  };
}
