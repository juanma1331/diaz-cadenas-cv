import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type Table as TableType,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ReloadIcon } from "@radix-ui/react-icons";
import CVTablePagination from "./cv-table-pagination";
import CVTableSearch from "./cv-table-search";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CVTableStorageUsed from "./cv-table-storage";
import CVTableVisibilityToggler from "./cv-table-visibility-toggler";

export interface CVTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  storageUsed: number;
}

export default function CVTableRows<TData, TValue>({
  columns,
  data,
  isLoading,
  storageUsed,
}: CVTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <CVTableSearch table={table} />

        <div className="flex items-center space-x-2">
          <CVTableVisibilityToggler columns={table.getAllColumns()} />
          <CVTableStorageUsed storageUsed={storageUsed} />
        </div>
      </div>
      <ScrollArea className="h-[740px] overflow-auto">
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
      <div className="flex items-center justify-end px-2">
        {!isLoading && <CVTablePagination table={table} />}
      </div>
    </div>
  );
}

function LoadingTableBody() {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={7} className="h-44">
          <div className="flex items-center flex-col gap-2">
            <ReloadIcon className="h-4 w-4 animate-spin mx-auto" />
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
          <TableCell colSpan={7} className="h-44 text-center">
            Actualmente no hay CVs para mostrar
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
}
