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
}: SortingColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div>{title}</div>;
  }

  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type PositionFilteringColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function PositionFilteringColumnHeader<TData, TValue>({
  column,
}: PositionFilteringColumnHeaderProps<TData, TValue>) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type PlaceFilteringColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function PlaceFilteringColumnHeader<TData, TValue>({
  column,
}: PlaceFilteringColumnHeaderProps<TData, TValue>) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
