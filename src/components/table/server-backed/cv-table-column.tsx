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
import {
  Calendar,
  CalendarDays,
  CalendarIcon,
  Dot,
  ListFilter,
  WandSparkles,
} from "lucide-react";
import { places, positions } from "@/constants";
import { CVSStatus } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { format, setDate } from "date-fns";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export type OnSort = (sort: ColumnSort) => void;
export type OnCleanSort = (id: string) => void;

export type SortingColumnHeaderProps = {
  id: "name" | "email";
  title: string;
  isDesc: boolean;
  isSorting: boolean;
  onSortingChange: OnSort;
  onCleanSort: OnCleanSort;
};
export function SortingColumnHeader({
  id,
  title,
  isDesc,
  isSorting,
  onSortingChange,
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
          {isSorting ? (
            isDesc ? (
              <ArrowDownIcon className="ml-2 h-3.5 w-3.5" />
            ) : (
              <ArrowUpIcon className="ml-2 h-3.5 w-3.5" />
            )
          ) : (
            <CaretSortIcon className="ml-2 h-3.5 w-3.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => onSortingChange({ id, desc: false })}
          className={
            isSorting && !isDesc ? "bg-primary text-primary-foreground" : ""
          }
        >
          <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortingChange({ id, desc: true })}
          className={
            isSorting && isDesc ? "bg-primary text-primary-foreground" : ""
          }
        >
          <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onCleanSort(id)}>
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

export function DateFilteringColumnHeader() {
  const [date, setDate] = useState<Date>();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`-ml-3 h-8 data-[state=open]:bg-accent`}
        >
          <span>Enviado</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <Popover modal={true}>
          <PopoverTrigger asChild>
            <DropdownMenuItem>
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Fecha
            </DropdownMenuItem>
          </PopoverTrigger>
        </Popover>
        {/* <DropdownMenuItem>
          <CalendarDays className="mr-2 h-3.5 w-3.5" />
          Rango de fechas
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("Cleaning")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
