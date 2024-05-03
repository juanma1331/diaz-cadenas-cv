import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLACES } from "@/constants";
import {
  LandPlot,
  ChevronDown,
  Dot,
  WandSparkles,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type {
  OnFilter,
  OnClearFilter,
  FilteringState,
  ColumnFilter,
} from "../../types";
import type { FilterToggler } from "./types";
import Toggler, { activeTogglersName } from "./shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type PlaceFilterProps = {
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

const initialTogglers: Array<FilterToggler> = PLACES.map((p) => ({
  name: p,
  checked: false,
}));

export default function PlaceFilter({
  onFilter,
  onClearFilter,
}: PlaceFilterProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [togglers, setTogglers] =
    useState<Array<FilterToggler>>(initialTogglers);

  function handleOnToggleOne(name: string, checked: boolean) {
    setTogglers((prev) => {
      const index = prev.findIndex((i) => i.name === name);

      if (index >= 0) {
        return [
          ...prev.slice(0, index),
          { name, checked },
          ...prev.slice(index + 1),
        ];
      }

      return prev;
    });

    const filter: ColumnFilter = { id: "place", value: name };

    checked ? onFilter(filter) : onClearFilter(filter);
  }

  function handleOnToggleAll(checked: boolean) {
    const toggled = togglers.map((i) => ({ name: i.name, checked }));

    setTogglers(toggled);

    const filters: FilteringState = toggled.map((t) => ({
      id: "place",
      value: t.name,
    }));

    checked ? onFilter(filters) : onClearFilter(filters);
  }

  function handleClearAll() {
    setTogglers((prev) => prev.map((i) => ({ name: i.name, checked: false })));

    onClearFilter(togglers.map((i) => ({ id: "place", value: i.name })));
  }

  function handleDeleteFilter() {
    handleClearAll();
    setOpen(false);
  }

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        {togglers.every((f) => f.checked === false) ? (
          <Button
            variant="outline"
            size="sm"
            className={`h-8 data-[state=open]:bg-accent`}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <LandPlot className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
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
                <LandPlot className="mr-1.5 h-3.5 w-3.5" />
                <span className="truncate max-w-36">
                  Lugar: {activeTogglersName(togglers)}
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
          <div className="px-6 py-2 flex items-center justify-between">
            <p>Lugar</p>

            <Button
              variant="link"
              size="icon"
              type="button"
              className="h-5 w-5"
              disabled={togglers.every((t) => t.checked === false)}
              onClick={handleDeleteFilter}
            >
              <Trash2 className="h-3.5 w-3.5 text-slate-800" />
            </Button>
          </div>
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
        </div>

        <div className="p-6 ">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={togglers.every((i) => i.checked === true)}
              id="place-filter-all"
              onCheckedChange={handleOnToggleAll}
            />
            <Label htmlFor="place-filter-all">Todos</Label>
          </div>

          <div className="px-3 mt-2">
            {togglers.map((p) => (
              <Toggler
                name={p.name}
                checked={p.checked}
                key={`place-filter-${p.name}`}
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
              disabled={togglers.every((i) => i.checked === false)}
              onClick={handleClearAll}
            >
              Limpiar Selección
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
