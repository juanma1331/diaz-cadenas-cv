import { flexRender, type Table as TableType } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCcw } from "lucide-react";

export interface CVTableProps<TData> {
  table: TableType<TData>;
  isLoading: boolean;
}

export default function CVTableRows<TData>({
  table,
  isLoading,
}: CVTableProps<TData>) {
  return (
    <ScrollArea className="h-[800px] overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        {isLoading ? <LoadingTableBody /> : <DataTableBody table={table} />}
      </Table>
    </ScrollArea>
  );
}

function LoadingTableBody() {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={8} className="h-44">
          <div className="flex items-center flex-col gap-2">
            <RefreshCcw className="h-4 w-4 animate-spin mx-auto" />
            <p>Cargando...</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function DataTableBody<TData>({ table }: { table: TableType<TData> }) {
  if (table.getRowModel().rows?.length) {
    return (
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="text-left">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  } else {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={8} className="h-44 text-center">
            Actualmente no hay CVs para mostrar
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
}
