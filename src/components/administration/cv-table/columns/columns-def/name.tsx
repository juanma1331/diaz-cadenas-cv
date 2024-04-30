import type { ColumnDef, SortingState } from "@tanstack/react-table";
import SortingColumnHeader from "../headers/sorting-column-header";
import type { CVRow } from "../../types";

export default function nameColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "name",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="name"
          title="Nombre"
          isDesc={isDesc(states.sortingState, "name")}
          isSorting={isSorting(states.sortingState, "name")}
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
