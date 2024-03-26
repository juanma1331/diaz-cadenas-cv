import {
  type ColumnDef,
  useReactTable,
  flexRender,
  getCoreRowModel,
  type Table as TableType,
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
import CVTableFilters from "./cv-table-filters";

export interface CVTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pages: number[];
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChage: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function CVTableRows<TData, TValue>({
  columns,
  data,
  isLoading,
  onPageChage,
  onLimitChange,
  pages,
  limit,
  page,
}: CVTableProps<TData, TValue>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  function clearFiltersAndSorting() {
    console.log("clearFiltersAndSorting");
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <CVTableSearch />

        <CVTableFilters />
      </div>
      <div className="max-h-[80vh] overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
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

          {isLoading
            ? loadingTableBody(columns.length)
            : dataTableBody(table, columns.length)}
        </Table>
      </div>
      {pages.length > 0 && (
        <CVTablePagination
          pages={pages}
          page={page}
          limit={limit}
          onLimitChange={onLimitChange}
          onPageChange={onPageChage}
        />
      )}
    </div>
  );
}

function loadingTableBody(colCount: number) {
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

function dataTableBody<TData>(table: TableType<TData>, colCount: number) {
  if (table.getRowModel().rows?.length) {
    return (
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="text-center">
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
