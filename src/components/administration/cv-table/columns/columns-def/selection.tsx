import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { CVRow } from "../../types";
import { useEffect, useState } from "react";
import type { RouterOuputs } from "@/server/utils";

export function selectionRowColumnDef(): ColumnDef<CVRow> {
  return {
    id: "select-col",
    header: ({ table }) => {
      const { states, tableData } = table.options.meta!;

      return (
        <Checkbox
          checked={isPageSelected(states.rowSelectionState, tableData)}
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

function isPageSelected(
  rowSelectionState: RowSelectionState,
  tableData: RouterOuputs["getAllCVS"]["cvs"]
) {
  const selectedIDs = Object.entries(rowSelectionState);

  return tableData.length > 1 && tableData.length === selectedIDs.length;
}
