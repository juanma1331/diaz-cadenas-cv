import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type { Column } from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { Columns3 } from "lucide-react";
import { DropdownMenuContent } from "../../ui/dropdown-menu";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";

export type CVTableVisibilityTogglerProps<TData, TValue> = {
  columns: Column<TData, TValue>[];
};

export default function CVTableVisibilityToggler<TData, TValue>({
  columns,
}: CVTableVisibilityTogglerProps<TData, TValue>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <Columns3 className="h-3.5 w-3.5 text-slate-400 " />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-2 p-3" align="start">
        {columns.map((column, i) => (
          <div
            className="flex items-center  space-x-2"
            key={`visibility-toggler-${i}`}
          >
            <Switch
              id={`visibility-switch-${i}`}
              checked={column.getIsVisible()}
              onCheckedChange={() => column.toggleVisibility()}
            />
            <Label htmlFor={column.id}>{column.id}</Label>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
