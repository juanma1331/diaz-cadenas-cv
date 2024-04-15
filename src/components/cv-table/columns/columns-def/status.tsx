import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, Filtering } from "./types";
import { StatusFilteringColumnHeader } from "../headers/status-filtering-column-header";
import { CVSStatus } from "@/constants";
import { Badge } from "@/components/ui/badge";

export type StatusColumnDefProps = {
  filtering: Filtering;
};
export function statusColumnDef({
  filtering,
}: StatusColumnDefProps): ColumnDef<CVRow> {
  return {
    accessorKey: "status",
    header: () => {
      return (
        <StatusFilteringColumnHeader
          filteringState={filtering.filteringState}
          onFilter={filtering.onFilteringChange}
          onClearFilter={filtering.onClearFilter}
        />
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as CVRow["status"];
      let badgeColor = "";
      let badgeText = "";

      switch (status) {
        case CVSStatus.PENDING:
          badgeColor =
            "bg-yellow-300 text-yellow-900 hover:bg-yellow-300/80 hover:text-yellow-900";
          badgeText = "Pendiente";
          break;

        case CVSStatus.REVIEWED:
          badgeColor =
            "bg-green-300 text-green-900 hover:bg-green-300/80 hover:text-green-900";
          badgeText = "Revisado";
          break;
        case CVSStatus.REJECTED:
          badgeColor =
            "bg-red-300 text-red-900 hover:bg-red-300/80 hover:text-red-900";
          badgeText = "Rechazado";
          break;
        case CVSStatus.SELECTED:
          badgeColor =
            "bg-blue-300 text-blue-900 hover:bg-blue-300/80 hover:text-blue-900";
          badgeText = "Seleccionado";
          break;
        default:
          throw new Error("Invalid status");
      }

      return <Badge className={badgeColor}>{badgeText}</Badge>;
    },
  };
}
