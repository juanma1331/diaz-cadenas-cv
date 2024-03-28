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
          <DropdownMenuItem onClick={() => column.setFilterValue("Carnicería")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Carnicería
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.setFilterValue("Charcutería")}
          >
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Charcutería
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Pescadería")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Pescadería
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Frutería")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Frutería
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Panadería")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Panadería
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Pastelería")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Pastelería
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Cajero")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Cajero
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Reponedor")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Reponedor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Limpieza")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Limpieza
          </DropdownMenuItem>
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
          <DropdownMenuItem onClick={() => column.setFilterValue("Andújar")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Andújar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Brenes")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Brenes
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.setFilterValue("Bollullos Par del Condado")}
          >
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Bollullos Par del Condado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Cádiz")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Cádiz
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.setFilterValue("Coria del Rio")}
          >
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Coria del Rio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Estepa")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Estepa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Gilena")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Gilena
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Hytasa")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hytasa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.setFilterValue("La Carolina")}
          >
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            La Carolina
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Lantejuela")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Lantejuela
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Moguer")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Moguer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Osuna")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Osuna
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.setFilterValue("Sanlúcar de Barrameda")}
          >
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sanlúcar de Barrameda
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Sevilla")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sevilla
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.setFilterValue("Utrera")}>
            <Dot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Utrera
          </DropdownMenuItem>
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
