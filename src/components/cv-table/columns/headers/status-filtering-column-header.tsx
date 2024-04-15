import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CVSStatus } from "@/constants";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { ListFilter, Dot, WandSparkles } from "lucide-react";
import type { OnFilter, OnClearFilter } from "../columns-def/types";

export type StatusFilteringColumnHeaderProps = {
  filteringState: ColumnFiltersState;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};
export function StatusFilteringColumnHeader({
  onFilter,
  filteringState,
  onClearFilter,
}: StatusFilteringColumnHeaderProps) {
  const currentFilter = filteringState.find((f) => f.id === "status");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`-ml-3 h-8 data-[state=open]:bg-accent`}
        >
          <span>Estado</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          className={
            currentFilter?.value === CVSStatus.PENDING
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: CVSStatus.PENDING })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === CVSStatus.PENDING
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Pendiente
        </DropdownMenuItem>
        <DropdownMenuItem
          className={
            currentFilter?.value === CVSStatus.REVIEWED
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: CVSStatus.REVIEWED })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === CVSStatus.REVIEWED
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Revisado
        </DropdownMenuItem>
        <DropdownMenuItem
          className={
            currentFilter?.value === CVSStatus.REJECTED
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: CVSStatus.REJECTED })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === CVSStatus.REJECTED
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Rechazado
        </DropdownMenuItem>
        <DropdownMenuItem
          className={
            currentFilter?.value === CVSStatus.SELECTED
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: CVSStatus.SELECTED })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === CVSStatus.SELECTED
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Seleccionado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onClearFilter("status")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
