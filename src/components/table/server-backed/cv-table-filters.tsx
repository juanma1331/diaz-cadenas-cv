import type {
  ColumnFilter,
  ColumnFiltersState,
  ColumnSort,
  SortingState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Filter,
  WandSparkles,
  X,
} from "lucide-react";

export type CVTableFiltersProps = {
  filteringState: ColumnFiltersState;
  sortingState: SortingState;
  setFilters: (filters: ColumnFiltersState) => void;
  setSorting: (sorting: SortingState) => void;
};

export default function CVTableFilters({
  filteringState,
  sortingState,
  setFilters,
  setSorting,
}: CVTableFiltersProps) {
  if (filteringState.length === 0 && sortingState.length === 0) {
    return null;
  }

  const sortAndFilters = [...sortingState, ...filteringState];

  return (
    <div className="flex items-center gap-1 h-10 p-2 border border-border rounded-md">
      {sortAndFilters.map((item, i) => {
        if (isFilter(item)) {
          const el = item as ColumnFilter;
          return (
            <Badge
              key={`table-filter-${i}`}
              variant="outline"
              className="flex items-center justify-center gap-1 cursor-pointer"
              onClick={() =>
                setFilters(filteringState.filter((f) => f.id !== el.id))
              }
            >
              <span>{el.value as string}</span>
              <Filter className="w-3.5 h-3.5" />
            </Badge>
          );
        }

        if (isSort(item)) {
          const el = item as ColumnSort;
          return (
            <Badge
              key={`table-filter-${i}`}
              variant="outline"
              className="flex items-center justify-center gap-1 cursor-pointer"
              onClick={() =>
                setSorting(sortingState.filter((s) => s.id !== el.id))
              }
            >
              <span className="capitalize">{el.id as string}</span>
              {el.desc ? (
                <ArrowDownIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpIcon className="h-3.5 w-3.5" />
              )}
            </Badge>
          );
        }
      })}
      <Badge
        key={`table-filter-all`}
        variant="destructive"
        className="flex items-center justify-center gap-1 cursor-pointer"
        onClick={() => {
          setFilters([]);
          setSorting([]);
        }}
      >
        <span>Limpiar</span>
        <WandSparkles className="h-3.5 w-3.5" />
      </Badge>
    </div>
  );
}

function isSort(obj: ColumnSort | ColumnFilter) {
  return "desc" in obj;
}

function isFilter(obj: ColumnSort | ColumnFilter) {
  return "value" in obj;
}
