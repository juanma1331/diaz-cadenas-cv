import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { CVRow } from "../../types";
import { useEffect, useState } from "react";

export function selectionRowColumnDef(): ColumnDef<CVRow> {
  return {
    id: "select-col",
    header: ({ table }) => {
      const [checked, setChecked] = useState(false);
      const { states, tableData } = table.options.meta!;

      useEffect(() => {
        const isAllPageSelected = () => {
          const selectedIDs = Object.entries(states.rowSelectionState);
          const dataIds = tableData.map((c) => c.id);

          return selectedIDs.every(([id, _]) => dataIds.includes(id));
        };

        if (isAllPageSelected()) {
          setChecked(true);
        } else {
          setChecked(false);
        }
      }, [states.rowSelectionState]);

      return (
        <Checkbox
          checked={checked}
          onCheckedChange={(e) => {
            setChecked(e as boolean);
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
