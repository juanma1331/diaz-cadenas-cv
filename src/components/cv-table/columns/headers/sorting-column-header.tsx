import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { ArrowDownIcon, ArrowUpIcon, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnCleanSort, OnSort } from "../columns-def/types";

export type SortingColumnHeaderProps = {
  id: "name" | "email";
  title: string;
  isDesc: boolean;
  isSorting: boolean;
  onSort: OnSort;
  onCleanSort: OnCleanSort;
};
export default function SortingColumnHeader({
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
