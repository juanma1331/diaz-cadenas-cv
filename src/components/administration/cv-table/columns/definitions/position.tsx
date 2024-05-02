import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";

export default function positionColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "position",
    header: () => <span className="text-slate-800">Posición</span>,
  };
}
