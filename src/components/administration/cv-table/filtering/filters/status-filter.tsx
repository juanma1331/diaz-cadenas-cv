import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CVS_STATUS } from "@/constants";
import { ChevronDown, ChevronUp, Trash2, FileCheck2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { OnFilter, OnClearFilter } from "../../types";
import type { FilterToggler } from "./types";
import Toggler, { activeTogglersName } from "./shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { statusMap } from "@/utils/shared";

export type StatusFilterProps = {
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
  isFiltering: boolean;
};

const FILTER_ID = "status";

const initialTogglers: Array<FilterToggler> = Object.entries(CVS_STATUS).map(
  ([_, v]) => ({
    name: statusMap(v),
    checked: false,
  })
);

export default function StatusFilter({
  onFilter,
  onClearFilter,
  isFiltering,
}: StatusFilterProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [togglers, setTogglers] =
    useState<Array<FilterToggler>>(initialTogglers);

  useEffect(() => {
    const toAdd = togglers.filter((t) => t.checked);
    const toRemove = togglers.filter((t) => !t.checked);
    onFilter(
      toAdd.map((a) => ({ id: FILTER_ID, value: fromMappedStatus(a.name) }))
    );
    onClearFilter(
      toRemove.map((a) => ({ id: FILTER_ID, value: fromMappedStatus(a.name) }))
    );
  }, [togglers]);

  function handleOnToggleOne(name: string, checked: boolean) {
    setTogglers((prev) => {
      const togglerToUpdateIndex = prev.findIndex((p) => p.name === name);
      const togglerToUpdate = prev[togglerToUpdateIndex];

      return [
        ...prev.slice(0, togglerToUpdateIndex),
        { ...togglerToUpdate, checked },
        ...prev.slice(togglerToUpdateIndex + 1),
      ];
    });
  }

  useEffect(() => {
    if (!isFiltering) {
      setTogglers((prev) => prev.map((t) => ({ ...t, checked: false })));
    }
  }, [isFiltering]);

  function handleTrash() {
    setTogglers((prev) => prev.map((t) => ({ ...t, checked: false })));
    setOpen(false);
  }

  function handleClearSelection() {
    setTogglers((prev) => prev.map((t) => ({ ...t, checked: false })));
  }

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        {!isFiltering ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <FileCheck2 className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
                <span className="text-slate-800">Estado</span>
              </div>
              {open ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={`h-8 border-primary bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary`}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
                <span className="truncate max-w-36">
                  Estado: {activeTogglersName(togglers)}
                </span>
              </div>

              {open ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onInteractOutside={() => setOpen(false)}
        className="p-0 min-w-60"
        align="start"
      >
        <div className="bg-muted/50">
          <div className="px-6 py-3 flex items-center justify-between">
            <p>Estado</p>

            <Button
              variant="link"
              size="icon"
              type="button"
              className="h-5 w-5"
              disabled={togglers.every((t) => t.checked === false)}
              onClick={handleTrash}
            >
              <Trash2 className="h-3.5 w-3.5 text-slate-800" />
            </Button>
          </div>
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
        </div>

        <div className="p-6 ">
          {togglers.map((p) => (
            <Toggler
              name={p.name}
              checked={p.checked}
              key={`status-filter-${p.name}`}
              onCheckedChange={handleOnToggleOne}
            />
          ))}
        </div>

        <div className="bg-muted/70">
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
          <div className="px-6 py-4">
            <Button
              type="button"
              className="p-0 h-fit"
              variant="link"
              disabled={togglers.every((i) => i.checked === false)}
              onClick={handleClearSelection}
            >
              Limpiar Selección
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function fromMappedStatus(status: string) {
  switch (status) {
    case "Pendiente":
      return CVS_STATUS.PENDING as number;
    case "Revisado":
      return CVS_STATUS.REVIEWED as number;
    case "Rechazado":
      return CVS_STATUS.REJECTED as number;
    case "Seleccionado":
      return CVS_STATUS.SELECTED as number;
    default:
      throw new Error("Invalid status");
  }
}
