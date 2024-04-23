import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { CVRow } from "./types";
import { useState } from "react";

export function selectionRowColumnDef(): ColumnDef<CVRow> {
  return {
    id: "select-col",
    header: ({ table }) => {
      const [open, setOpen] = useState(false);
      return (
        <Checkbox
          checked={open}
          onCheckedChange={(e) => {
            setOpen(e as boolean);
            const toggler = table.getToggleAllPageRowsSelectedHandler();
            toggler({ target: { checked: e } }); // Toggler expect {target: {checked: boolean}}
          }}
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={row.getToggleSelectedHandler()}
      />
    ),
  };
}
