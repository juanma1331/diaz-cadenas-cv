import type { ColumnDef, SortingState } from "@tanstack/react-table";
import SortingColumnHeader from "../headers/sorting-column-header";
import type { CVRow, Sorting } from "./types";

export type NameColumnDefProps = {
  sorting: Sorting;
};

export default function nameColumnDef({
  sorting,
}: NameColumnDefProps): ColumnDef<CVRow> {
  return {
    accessorKey: "name",
    header: () => {
      return (
        <SortingColumnHeader
          id="name"
          title="Nombre"
          isDesc={isDesc(sorting.sortingState, "name")}
          isSorting={isSorting(sorting.sortingState, "name")}
          onSort={sorting.onSort}
          onCleanSort={sorting.onCleanSort}
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
