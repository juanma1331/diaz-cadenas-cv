import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, DateFiltering } from "./types";
import { DateFilteringColumnHeader } from "../headers/date-filtering-column-header";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export type CreatedAtColumnDefProps = {
  dateFiltering: DateFiltering;
};

export default function createdAtColumnDef({
  dateFiltering,
}: CreatedAtColumnDefProps): ColumnDef<CVRow> {
  return {
    accessorKey: "createdAt",
    header: () => {
      return (
        <DateFilteringColumnHeader
          onDateFilter={dateFiltering.onDateFilter}
          onSort={dateFiltering.onSort}
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
