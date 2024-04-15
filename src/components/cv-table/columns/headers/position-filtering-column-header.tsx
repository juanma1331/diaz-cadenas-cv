import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { positions } from "@/constants";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ListFilter, Dot, WandSparkles } from "lucide-react";
import type { OnClearFilter, OnFilter } from "../columns-def/types";

type PositionFilteringColumnHeaderProps = {
  filteringState: ColumnFiltersState;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};
export function PositionFilteringColumnHeader({
  filteringState,
  onFilter,
  onClearFilter,
}: PositionFilteringColumnHeaderProps) {
  const currentFilter = filteringState.find((f) => f.id === "position");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`-ml-3 h-8 data-[state=open]:bg-accent`}
        >
          <span>Puesto</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {positions.map((position, i) => (
          <DropdownMenuItem
            key={`dropdown-filter-${position}-${i}`}
            className={
              currentFilter?.value === position
                ? "bg-primary text-primary-foreground"
                : ""
            }
            onClick={() => onFilter({ id: "position", value: position })}
          >
            <Dot
              className={`mr-2 h-3.5 w-3.5 ${
                currentFilter?.value === position
                  ? "text-primary-foreground"
                  : "text-muted-foreground/70"
              }`}
            />
            {position}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onClearFilter("position")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
