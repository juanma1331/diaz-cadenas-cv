import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import { CVS_STATUS } from "@/constants";
import { Badge } from "@/components/ui/badge";
import SortingColumnHeader, {
  isDesc,
  isSorting,
} from "../headers/sorting-column-header";

export default function statusColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "status",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="status"
          title="Estado"
          isDesc={isDesc(states.sortingState, "status")}
          isSorting={isSorting(states.sortingState, "status")}
          onSort={handlers.onSort}
          onCleanSort={handlers.onCleanSort}
        />
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as CVRow["status"];
      let badgeColor = "";
      let badgeText = "";

      switch (status) {
        case CVS_STATUS.PENDING:
          badgeColor =
            "bg-yellow-300 text-yellow-900 hover:bg-yellow-300/80 hover:text-yellow-900";
          badgeText = "Pendiente";
          break;

        case CVS_STATUS.REVIEWED:
          badgeColor =
            "bg-green-300 text-green-900 hover:bg-green-300/80 hover:text-green-900";
          badgeText = "Revisado";
          break;
        case CVS_STATUS.REJECTED:
          badgeColor =
            "bg-red-300 text-red-900 hover:bg-red-300/80 hover:text-red-900";
          badgeText = "Rechazado";
          break;
        case CVS_STATUS.SELECTED:
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
