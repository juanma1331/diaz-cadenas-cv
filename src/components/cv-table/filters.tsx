import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Calendar,
  Filter,
  WandSparkles,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CVSStatus } from "@/constants";
import type { DateFilteringState } from "./columns";

export type CVTableFiltersProps = {
  filteringState: ColumnFiltersState;
  dateFilteringState: DateFilteringState;
  sortingState: SortingState;
  setFilters: (filters: ColumnFiltersState) => void;
  setDateFilters: (dateFilters: DateFilteringState) => void;
  setSorting: (sorting: SortingState) => void;
};

export default function CVTableFilters({
  filteringState,
  dateFilteringState,
  sortingState,
  setFilters,
  setDateFilters,
  setSorting,
}: CVTableFiltersProps) {
  if (
    filteringState.length === 0 &&
    sortingState.length === 0 &&
    dateFilteringState === undefined
  ) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 h-10 p-2 border border-border rounded-md">
      {sortingState.map((item, i) => {
        let text = item.id as string;
        switch (item.id) {
          case "createdAt":
            text = "enviado";
            break;
          case "name":
            text = "nombre";
            break;
        }
        return (
          <Badge
            key={`table-filter-${i}`}
            variant="outline"
            className="flex items-center justify-center gap-1 cursor-pointer border-yellow-400"
            onClick={() =>
              setSorting(sortingState.filter((s) => s.id !== item.id))
            }
          >
            <span className="capitalize">{text}</span>
            {item.desc ? (
              <ArrowDownIcon className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpIcon className="h-3.5 w-3.5" />
            )}
          </Badge>
        );
      })}

      {filteringState.map((item, i) => {
        let text = item.value as string;
        const isStatus = item.id === "status";

        if (isStatus) {
          switch (item.value) {
            case CVSStatus.PENDING:
              text = "Pendiente";
              break;
            case CVSStatus.REJECTED:
              text = "Rechazado";
              break;
            case CVSStatus.REVIEWED:
              text = "Revisado";
              break;
            case CVSStatus.SELECTED:
              text = "Seleccionado";
              break;
            default:
              throw new Error("Invalid status");
          }
        }

        return (
          <Badge
            key={`table-sort-${i}`}
            variant="outline"
            className="flex items-center justify-center gap-1 cursor-pointer border-blue-400"
            onClick={() =>
              setFilters(filteringState.filter((f) => f.id !== item.id))
            }
          >
            <span>{text}</span>
            <Filter className="w-3.5 h-3.5" />
          </Badge>
        );
      })}

      {dateFilteringState &&
        (dateFilteringState.type === "single" ? (
          <Badge
            key="table-filter-date-single"
            variant="outline"
            className="flex items-center justify-center gap-1 cursor-pointer border-purple-400"
            onClick={() => setDateFilters(undefined)}
          >
            <span>
              {format(dateFilteringState.date, "dd/MM/yyyy", { locale: es })}
            </span>
            <Calendar className="mr-2 h-3.5 w-3.5" />
          </Badge>
        ) : dateFilteringState.type === "range" ? (
          <Badge
            key="table-filter-date-range"
            variant="outline"
            className="flex items-center justify-center gap-1 cursor-pointer border-purple-400"
            onClick={() => setDateFilters(undefined)}
          >
            <span>{`${format(dateFilteringState.from, "dd/MM/yyyy", {
              locale: es,
            })} - ${format(dateFilteringState.to, "dd/MM/yyyy", {
              locale: es,
            })}`}</span>
            <Calendar className="mr-2 h-3.5 w-3.5" />
          </Badge>
        ) : null)}

      <Badge
        key={`table-filter-clean-all`}
        variant="destructive"
        className="flex items-center justify-center gap-1 cursor-pointer"
        onClick={() => {
          setFilters([]);
          setSorting([]);
          setDateFilters(undefined);
        }}
      >
        <span>Limpiar</span>
        <WandSparkles className="h-3.5 w-3.5" />
      </Badge>
    </div>
  );
}
