import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import { type Column } from "@tanstack/react-table";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dot, Eraser, ListFilter } from "lucide-react";
import { places, positions } from "@/constants";

interface SortingColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function SortingColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: SortingColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PositionFilteringColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function PositionFilteringColumnHeader<TData, TValue>({
  column,
}: PositionFilteringColumnHeaderProps<TData, TValue>) {
  const isFiltered = column.getIsFiltered();
  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`-ml-3 h-8 data-[state=open]:bg-accent ${
              isFiltered ? "border border-blue-800" : ""
            } ${isFiltered ? "text-blue-800" : ""}`}
          >
            <span>Posición</span>
            <ListFilter
              className={`h-4 w-4 ml-2 ${
                isFiltered ? "text-blue-800" : "text-slate-400"
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {positions.map((position) => (
            <DropdownMenuItem
              key={position}
              onClick={() => column.setFilterValue(position)}
            >
              <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              {position}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.setFilterValue("")}>
            <Eraser className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Limpiar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PlaceFilteringColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function PlaceFilteringColumnHeader<TData, TValue>({
  column,
}: PlaceFilteringColumnHeaderProps<TData, TValue>) {
  const isFiltered = column.getIsFiltered();
  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`-ml-3 h-8 data-[state=open]:bg-accent ${
              isFiltered ? "border border-blue-800" : ""
            } ${isFiltered ? "text-blue-800" : ""}`}
          >
            <span>Ubicación</span>
            <ListFilter
              className={`h-4 w-4 ml-2 ${
                isFiltered ? "text-blue-800" : "text-slate-400"
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {places.map((place) => (
            <DropdownMenuItem
              key={place}
              onClick={() => column.setFilterValue(place)}
            >
              <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              {place}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.setFilterValue("")}>
            <Eraser className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Limpiar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ocultar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
