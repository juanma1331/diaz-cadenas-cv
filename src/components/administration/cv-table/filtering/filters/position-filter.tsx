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
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

const FILTER_ID = "position";

const initialTogglers = POSITIONS.map((p) => ({ name: p, checked: true }));

export default function PositionFilter({
  onFilter,
  onClearFilter,
}: PositionFilterProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [togglers, setTogglers] =
    useState<Array<FilterToggler>>(initialTogglers);

  const isAnyFilterActive = togglers.some((toggle) => !toggle.checked);

  useEffect(() => {
    const toAdd = togglers.filter((t) => t.checked);
    const toRemove = togglers.filter((t) => !t.checked);
    onFilter(toAdd.map((a) => ({ id: FILTER_ID, value: a.name })));
    onClearFilter(toRemove.map((a) => ({ id: FILTER_ID, value: a.name })));
  }, [togglers]);

  function handleOnToggleOne(name: string, checked: boolean) {
    setTogglers((prev) => {
      // Should not be able to uncheck all toggles
      if (prev.filter((t) => t.checked).length === 1 && !checked) {
        return prev;
      }

      const togglerToUpdateIndex = prev.findIndex((p) => p.name === name);
      const togglerToUpdate = prev[togglerToUpdateIndex];

      return [
        ...prev.slice(0, togglerToUpdateIndex),
        { ...togglerToUpdate, checked },
        ...prev.slice(togglerToUpdateIndex + 1),
      ];
    });
  }

  function handleToggleAll(checked: boolean) {
    if (!checked) {
      setTogglers((prev) => [
        { ...prev[0], checked: true },
        ...prev.slice(1).map((t) => ({ ...t, checked })),
      ]);
    } else {
      setTogglers((prev) => prev.map((t) => ({ ...t, checked })));
    }
  }

  function handleTrash() {
    setTogglers((prev) => prev.map((t) => ({ ...t, checked: true })));
    setOpen(false);
  }

  function handleClearSelection() {
    setTogglers((prev) => prev.map((t) => ({ ...t, checked: true })));
  }

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        {!isAnyFilterActive ? (
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

        <div className="p-6 ">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={togglers.every((t) => t.checked)}
              id="position-filter-all"
              onCheckedChange={handleToggleAll}
            />
            <Label htmlFor="position-filter-all">Todos</Label>
          </div>

          <div className="px-3 mt-2">
            {togglers.map((toggler) => (
              <Toggler
                name={toggler.name}
                checked={toggler.checked}
                key={`position-filter-${toggler.name}`}
                onCheckedChange={handleOnToggleOne}
              />
            ))}
          </div>
        </div>

        <div className="bg-muted/70">
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
          <div className="px-6 py-4">
            <Button
              type="button"
              className="p-0 h-fit"
              variant="link"
              disabled={togglers.every((i) => i.checked === true)}
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
