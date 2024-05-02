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
import { Network, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { OnClearFilter, OnFilter } from "../../types";

export type PositionFilterProps = {
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
};

interface FilterItem {
  name: string;
  checked: boolean;
}

const filterItems: Array<FilterItem> = POSITIONS.map((p) => ({
  name: p,
  checked: false,
}));

export default function PositionFilter({
  onFilter,
  onClearFilter,
}: PositionFilterProps) {
  const [items, setItems] = useState<Array<FilterItem>>(filterItems);

  function handleOnCheckedChange(name: string, checked: boolean) {
    setItems((prev) => {
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

    // Vas por aqui
  }

  function handleCleanSelection() {
    const itemsToCleanFromFiltering = items.filter((i) => i.checked === true);
    onClearFilter(
      itemsToCleanFromFiltering.map((i) => ({ id: "position", value: i.name }))
    );

    setItems((prev) => prev.map((i) => ({ name: i.name, checked: false })));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 data-[state=open]:bg-accent`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Network className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
              <span className="text-slate-800">Posición</span>
            </div>

            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 min-w-60" align="start">
        <div className="bg-muted/50">
          <div className="px-6 py-2 flex items-center justify-between">
            <p>Posición</p>

            <Button variant="link" size="icon" type="button">
              <Trash2 className="h-3.5 w-3.5 text-slate-800" />
            </Button>
          </div>
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
        </div>

        <div className="p-6 ">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={items.every((i) => i.checked === true)}
              id="position-filter-all"
              onCheckedChange={(e) =>
                setItems((prev) =>
                  prev.map((i) => ({ name: i.name, checked: e as boolean }))
                )
              }
            />
            <Label htmlFor="position-filter-all">Todos</Label>
          </div>

          <div className="px-3 mt-2">
            {items.map((p) => (
              <Item
                name={p.name}
                checked={p.checked}
                key={`position-filter-${p.name}`}
                onCheckedChange={handleOnCheckedChange}
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
              disabled={items.every((i) => i.checked === false)}
              onClick={handleCleanSelection}
            >
              Limpiar Selección
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ItemProps extends FilterItem {
  onCheckedChange: (name: string, checked: boolean) => void;
}
function Item({ name, checked, onCheckedChange }: ItemProps) {
  return (
    <div className="py-1 flex items-center gap-2">
      <Checkbox
        onCheckedChange={(e) => onCheckedChange(name, !checked)}
        checked={checked}
        id={`position-filter-${name}`}
      />
      <Label
        className="text-sm font-normal"
        htmlFor={`position-filter-${name}`}
      >
        {name}
      </Label>
    </div>
  );
}
