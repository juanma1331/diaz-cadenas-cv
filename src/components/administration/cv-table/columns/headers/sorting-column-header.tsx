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
import type { OnCleanSort, OnSort } from "../../types";
import type { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import type { z } from "zod";
import type { sortSchema } from "@/server/routes/get-all-cvs";

type ID = z.infer<typeof sortSchema>["id"];

export type SortingColumnHeaderProps = {
  id: ID;
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
  function handleOnClick() {
    if (!isSorting) {
      onSort({ id: id, desc: true });
    } else if (isDesc) {
      onSort({ id: id, desc: false });
    } else {
      onCleanSort(id);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={handleOnClick}
    >
      <span className="text-slate-800">{title}</span>
      {isSorting ? (
        isDesc ? (
          <ArrowDownIcon className="ml-2 h-3.5 w-3.5 text-primary" />
        ) : (
          <ArrowUpIcon className="ml-2 h-3.5 w-3.5 text-primary" />
        )
      ) : (
        <CaretSortIcon className="ml-2 h-3.5 w-3.5 text-slate-800" />
      )}
    </Button>
  );
}

export function isDesc(sortingState: SortingState, id: ID) {
  return sortingState.some((s) => s.id === id && s.desc === true);
}

export function isSorting(sortingState: SortingState, id: ID) {
  return sortingState.some((s) => s.id === id);
}
