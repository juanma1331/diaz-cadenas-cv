import { SlidersHorizontal } from "lucide-react";
import PositionFilter from "./filters/position-filter";
import PlaceFilter from "./filters/place-filter";
import StatusFilter from "./filters/status-filter";
import type {
  DateFilteringState,
  OnClearDateFilter,
  OnClearFilter,
  OnDateFilter,
  OnFilter,
  OnSort,
} from "../types";
import CreatedAtFilter from "./filters/created-at-filter";

export type TableFiltersProps = {
  dateFilteringState: DateFilteringState;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
  onSort: OnSort;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

export default function TableFilters({
  dateFilteringState,
  onDateFilter,
  onClearDateFilter,
  onFilter,
  onClearFilter,
  onSort,
}: TableFiltersProps) {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 mr-0.5" />
        <span className="text-sm font-bold">Filtros</span>
      </div>

      <div className="space-x-2.5">
        <PositionFilter onFilter={onFilter} onClearFilter={onClearFilter} />
        <PlaceFilter />
        <StatusFilter />
        <CreatedAtFilter
          dateFilteringState={dateFilteringState}
          onDateFilter={onDateFilter}
          onClearDateFilter={onClearDateFilter}
          onSort={onSort}
        />
      </div>
    </div>
  );
}
