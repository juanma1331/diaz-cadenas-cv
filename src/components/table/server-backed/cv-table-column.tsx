import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import {
  type ColumnFilter,
  type ColumnFiltersState,
  type ColumnSort,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dot, ListFilter, WandSparkles } from "lucide-react";
import { places, positions } from "@/constants";

export type OnSort = (sort: ColumnSort) => void;
export type OnCleanSort = (id: string) => void;

export type SortingColumnHeaderProps = {
  title: string;
  onSort: OnSort;
  sort: ColumnSort;
  isSorting: boolean;
  onCleanSort: OnCleanSort;
};

export function SortingColumnHeader({
  title,
  onSort,
  sort,
  isSorting,
  onCleanSort,
}: SortingColumnHeaderProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{title}</span>
          {!isSorting ? (
            <CaretSortIcon className="ml-2 h-3.5 w-3.5" />
          ) : sort.desc ? (
            <ArrowDownIcon className="h-3.5 w-3.5 ml-2" />
          ) : (
            <ArrowUpIcon className="h-3.5 w-3.5 ml-2" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onSort({ id: sort.id, desc: false })}>
          <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort({ id: sort.id, desc: true })}>
          <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onCleanSort(sort.id)}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type OnFilter = (filter: ColumnFilter) => void;
export type OnClearFilter = (id: string) => void;
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

type PlaceFilteringColumnHeaderProps = {
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

type StatusFilteringColumnHeaderProps = {
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
            currentFilter?.value === "Pendiente"
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: "Pendiente" })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === "Pendiente"
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Pendiente
        </DropdownMenuItem>
        <DropdownMenuItem
          className={
            currentFilter?.value === "Revisado"
              ? "bg-primary text-primary-foreground"
              : ""
          }
          onClick={() => onFilter({ id: "status", value: "Revisado" })}
        >
          <Dot
            className={`mr-2 h-3.5 w-3.5 ${
              currentFilter?.value === "Revisado"
                ? "text-primary-foreground"
                : "text-muted-foreground/70"
            }`}
          />
          Revisado
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