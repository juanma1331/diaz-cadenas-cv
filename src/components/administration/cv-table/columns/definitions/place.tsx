import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";

export default function placeColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "place",
    header: () => <span className="text-slate-800">Lugar</span>,
  };
}
