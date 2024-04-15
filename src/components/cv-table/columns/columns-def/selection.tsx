import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "..";
import { Checkbox } from "@/components/ui/checkbox";

export function selectionRowColumnDef(): ColumnDef<CVRow> {
  return {
    id: "select-col",
    header: ({ table }) => {
      return (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(e) => {
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
