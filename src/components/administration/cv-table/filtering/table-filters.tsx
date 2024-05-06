import { SlidersHorizontal, Trash2 } from "lucide-react";
import PositionFilter from "./filters/position-filter";
import PlaceFilter from "./filters/place-filter";
import StatusFilter from "./filters/status-filter";
import type {
  ColumnFilter,
  DateFilteringState,
  FilteringState,
  OnClearDateFilter,
  OnClearFilter,
  OnDateFilter,
  OnFilter,
  OnSort,
} from "../types";
import CreatedAtFilter from "./filters/created-at-filter";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { WandSparkles } from "lucide-react";

export type TableFiltersProps = {
  filteringState: FilteringState;
  dateFilteringState: DateFilteringState;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
  onSort: OnSort;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

export default function TableFilters({
  filteringState,
  dateFilteringState,
  onDateFilter,
  onClearDateFilter,
  onFilter,
  onClearFilter,
  onSort,
}: TableFiltersProps) {
  function handleClearAllFilters() {
    onClearDateFilter();
    onClearFilter(filteringState.map((f) => f));
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 mr-0.5" />
        <span className="text-sm font-bold">Filtros</span>
      </div>

      <div className="flex items-center gap-2">
        <PositionFilter
          filteringState={filteringState}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />
        <PlaceFilter
          filteringState={filteringState}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />
        <StatusFilter
          filteringState={filteringState}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />

        <Separator
          orientation="vertical"
          className="mx-1 border h-7 rounded-md border-border"
        />

        <CreatedAtFilter
          dateFilteringState={dateFilteringState}
          onDateFilter={onDateFilter}
          onClearDateFilter={onClearDateFilter}
        />

        <Separator
          orientation="vertical"
          className="mx-1 border h-7 rounded-md border-border"
        />

        <Button
          className="h-8"
          variant="outline"
          disabled={
            dateFilteringState === undefined && filteringState.length === 0
          }
          onClick={handleClearAllFilters}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}

export function isOnFilteringState(
  filter: ColumnFilter,
  state: FilteringState
) {
  return state.some((f) => f.id === filter.id && f.value === filter.value);
}
