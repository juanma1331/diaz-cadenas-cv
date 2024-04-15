import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { places } from "@/constants";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ListFilter, Dot, WandSparkles } from "lucide-react";
import type {
  OnFilter,
  OnClearFilter,
} from "./position-filtering-column-header";

export type PlaceFilteringColumnHeaderProps = {
  filteringState: ColumnFiltersState;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};
export function PlaceFilteringColumnHeader({
  onFilter,
  filteringState,
  onClearFilter,
}: PlaceFilteringColumnHeaderProps) {
  const currentFilter = filteringState.find((f) => f.id === "place");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`-ml-3 h-8 data-[state=open]:bg-accent`}
        >
          <span>Ubicación</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {places.map((place, i) => (
          <DropdownMenuItem
            key={`dropdown-filter-${place}-${i}`}
            className={
              currentFilter?.value === place
                ? "bg-primary text-primary-foreground"
                : ""
            }
            onClick={() => onFilter({ id: "place", value: place })}
          >
            <Dot
              className={`mr-2 h-3.5 w-3.5 ${
                currentFilter?.value === place
                  ? "text-primary-foreground"
                  : "text-muted-foreground/70"
              }`}
            />
            {place}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onClearFilter("place")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
