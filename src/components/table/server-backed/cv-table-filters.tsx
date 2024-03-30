import type { ColumnFiltersState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export type CVTableFiltersProps = {
  filters: ColumnFiltersState;
  setFilters: (filters: ColumnFiltersState) => void;
};

export default function CVTableFilters({
  filters,
  setFilters,
}: CVTableFiltersProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 h-10 p-2 border border-border rounded-md">
      {filters.map((filter, i) => (
        <Badge
          key={`table-filter-${i}`}
          variant="outline"
          className="flex items-center justify-center cursor-pointer hover:bg-slate-300"
          onClick={() => setFilters(filters.filter((f) => f.id !== filter.id))}
        >
          <span>{filter.value as string}</span>
          <X className="h-3.5 w-3.5 ml-1" />
        </Badge>
      ))}
      <Badge
        key={`table-filter-all`}
        variant="outline"
        className="flex items-center justify-center cursor-pointer hover:bg-slate-300"
        onClick={() => setFilters([])}
      >
        <span>Todos</span>
        <X className="h-3.5 w-3.5 ml-1" />
      </Badge>
    </div>
  );
}
