import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { POSITIONS } from "@/constants";
import { Network, ChevronDown, Trash2, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { OnClearFilter, OnFilter } from "../../types";
import type { FilterToggler } from "./types";
import Toggler, { activeTogglersName } from "./shared";

export type PositionFilterProps = {
  isFiltering: boolean;
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

const FILTER_ID = "position";

const initialTogglers = POSITIONS.map((p) => ({ name: p, checked: false }));

export default function PositionFilter({
  onFilter,
  onClearFilter,
  isFiltering,
}: PositionFilterProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [togglers, setTogglers] =
    useState<Array<FilterToggler>>(initialTogglers);

  useEffect(() => {
    const toAdd = togglers.filter((t) => t.checked);
    const toRemove = togglers.filter((t) => !t.checked);
    onFilter(toAdd.map((a) => ({ id: FILTER_ID, value: a.name })));
    onClearFilter(toRemove.map((a) => ({ id: FILTER_ID, value: a.name })));
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
                <Network className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
                <span className="text-slate-800">Posición</span>
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
                <Network className="mr-1.5 h-3.5 w-3.5" />
                <span className="truncate max-w-36">
                  Posición: {activeTogglersName(togglers)}
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
            <p>Posición</p>

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

        <div className="p-6">
          {togglers.map((toggler) => (
            <Toggler
              name={toggler.name}
              checked={toggler.checked}
              key={`position-filter-${toggler.name}`}
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
