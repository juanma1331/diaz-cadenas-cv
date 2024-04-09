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
import { es } from "date-fns/locale";

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
} from "@/components/ui/popover"; // TODO: Uninstall component
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DateRange } from "react-day-picker";

export type OnSort = (sort: ColumnSort) => void;
export type OnCleanSort = (id: string) => void;

export type SortingColumnHeaderProps = {
  id: "name" | "email";
  title: string;
  isDesc: boolean;
  isSorting: boolean;
  onSort: OnSort;
  onCleanSort: OnCleanSort;
};
export function SortingColumnHeader({
  id,
  title,
  isDesc,
  isSorting,
  onSort,
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
          onClick={() => onSort({ id, desc: false })}
          className={
            isSorting && !isDesc ? "bg-primary text-primary-foreground" : ""
          }
        >
          <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSort({ id, desc: true })}
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

export type OnDateFilter = (filter: {
  type: "single" | "range";
  value: Date | DateRange;
}) => void;
export type DateFilteringColumnHeaderProps = {
  onDateFilter: OnDateFilter;
  onSort: OnSort;
};
export function DateFilteringColumnHeader({
  onDateFilter,
  onSort,
}: DateFilteringColumnHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [single, setSingle] = useState<Date>();
  const [range, setRange] = useState<DateRange | undefined>();

  const handleOnDateFilter = (type: "single" | "range") => {
    if (type === "single") {
      if (!single) throw new Error("Single date undefined");
      onDateFilter({ type: "single", value: single });
    }

    if (type === "range") {
      if (!range) throw new Error("Range date undefined");
      onDateFilter({ type: "range", value: range });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
      <DropdownMenuContent align="start" className="w-fit">
        <Tabs
          defaultValue="single"
          onValueChange={(val) => {
            if (val === "desc") {
              onSort({ id: "createdAt", desc: false });
              setOpen(false);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="single">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Fecha
            </TabsTrigger>
            <TabsTrigger value="range">
              <CalendarDays className="mr-2 h-3.5 w-3.5" />
              Rango
            </TabsTrigger>
            <TabsTrigger value="desc">
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5" />
              Asc
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="space-y-2">
            <CalendarComponent
              locale={es}
              mode="single"
              selected={single}
              onSelect={setSingle}
              initialFocus
            />
            {single && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOnDateFilter("single")}
              >
                Aplicar
              </Button>
            )}
          </TabsContent>
          <TabsContent value="range" className="space-y-2">
            <CalendarComponent
              locale={es}
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
            />
            {range && range.to && range.from && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOnDateFilter("range")}
              >
                Aplicar
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
