import type { ColumnDef, SortingState } from "@tanstack/react-table";
import SortingColumnHeader from "../headers/sorting-column-header";
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

function isDesc(sortingState: SortingState, id: "name" | "email") {
  return sortingState.some((s) => s.id === id && s.desc === true);
}

function isSorting(sortingState: SortingState, id: "name" | "email") {
  return sortingState.some((s) => s.id === id);
}
