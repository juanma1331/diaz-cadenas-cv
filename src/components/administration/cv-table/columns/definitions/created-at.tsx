import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow } from "../../types";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import SortingColumnHeader, {
  isDesc,
  isSorting,
} from "../headers/sorting-column-header";

export default function createdAtColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "createdAt",
    header: ({ table }) => {
      const { handlers, states } = table.options.meta!;

      return (
        <SortingColumnHeader
          id="createdAt"
          title="Recibido"
          isDesc={isDesc(states.sortingState, "createdAt")}
          isSorting={isSorting(states.sortingState, "createdAt")}
          onSort={handlers.onSort}
          onCleanSort={handlers.onCleanSort}
        />
      );
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;

      return <CreatedAtCell createdAt={createdAt} />;
    },
  };
}

function CreatedAtCell({ createdAt }: { createdAt: string }) {
  const formatted = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: es,
  });
  return (
    <div className="flex flex-col">
      <span>{formatted.replace("alrededor de ", "")}</span>
      <span className="text-xs text-slate-500">
        {`${format(createdAt, "dd/MM/yyyy", { locale: es })}`}
      </span>
    </div>
  );
}
