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
} from "../types";
import CreatedAtFilter from "./filters/created-at-filter";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CVS_STATUS, PLACES, POSITIONS } from "@/constants";
import { statusMap } from "@/utils/shared";

export type TableFiltersProps = {
  filteringState: FilteringState;
  dateFilteringState: DateFilteringState;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
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
}: TableFiltersProps) {
  function handleClearAll() {
    onClearDateFilter();
    onClearFilter(filteringState.map((f) => f));
  }

  function handleClearFromID(id: ColumnFilter["id"]) {
    onClearFilter(filteringState.filter((f) => f.id === id));
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 mr-0.5" />
        <span className="text-sm font-bold">Filtros</span>
      </div>

      <div className="flex items-center gap-2">
        <PositionFilter
          togglers={POSITIONS.map((p) => ({
            name: p,
            checked: isOnFilteringState(
              { id: "position", value: p },
              filteringState
            ),
          }))}
          onClearFromID={handleClearFromID}
          isFiltering={filteringState.some((f) => f.id === "position")}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />

        <PlaceFilter
          togglers={PLACES.map((p) => ({
            name: p,
            checked: isOnFilteringState(
              { id: "place", value: p },
              filteringState
            ),
          }))}
          onClearFromID={handleClearFromID}
          isFiltering={filteringState.some((f) => f.id === "place")}
          onFilter={onFilter}
          onClearFilter={onClearFilter}
        />

        <StatusFilter
          togglers={Object.entries(CVS_STATUS).map(([_, v]) => ({
            name: statusMap(v),
            checked: isOnFilteringState(
              { id: "status", value: v },
              filteringState
            ),
          }))}
          onClearFromID={handleClearFromID}
          isFiltering={filteringState.some((f) => f.id === "status")}
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
          onClick={handleClearAll}
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
