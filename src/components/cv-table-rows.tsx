import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Eraser } from "lucide-react";
import { generateColumns } from "./cv-table-columns";

export interface CVTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function CVTableRows<TData, TValue>({
  columns,
  data,
}: CVTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterBy, setFilterBy] = useState<
    "name" | "email" | "place" | "position" | "status"
  >("name");

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  function clearFiltersAndSorting() {
    setColumnFilters([]);
    setSorting([]);
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(value) => {
            setFilterBy(value as any);
          }}
          defaultValue="name"
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Seleccione el filtro" />
          </SelectTrigger>
          <SelectContent className="max-w-sm">
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="place">Lugar</SelectItem>
            <SelectItem value="position">Puesto</SelectItem>
            <SelectItem value="status">Estado</SelectItem>
          </SelectContent>
        </Select>

        {getFilterComponent(table, filterBy)}

        <Button variant="outline" size="icon" onClick={clearFiltersAndSorting}>
          <Eraser className="stroke-slate-500" />
        </Button>
      </div>
      <div className="rounded-md border-border">
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

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  Actualmente no hay CVs para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getFilterComponent<TData>(
  table: TableType<TData>,
  filterBy: "name" | "email" | "place" | "position" | "status"
) {
  if (filterBy === "name") {
    return (
      <Input
        placeholder="Nombre"
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    );
  } else if (filterBy === "email") {
    return (
      <Input
        placeholder="Email"
        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("email")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    );
  } else if (filterBy === "place") {
    return (
      <Select
        value={(table.getColumn("place")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) => {
          table.getColumn("place")?.setFilterValue(value);
        }}
      >
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Seleccione el lugar" />
        </SelectTrigger>
        <SelectContent className="max-w-sm">
          <SelectItem value="Andújar">Andújar</SelectItem>
          <SelectItem value="Brenes">Brenes</SelectItem>
          <SelectItem value="Bollullos Par del Condado">
            Bollullos Par del Condado
          </SelectItem>
          <SelectItem value="Cádiz">Cádiz</SelectItem>
          <SelectItem value="Coria del Rio">Coria del Rio</SelectItem>
          <SelectItem value="Estepa">Estepa</SelectItem>
          <SelectItem value="Gilena">Gilena</SelectItem>
          <SelectItem value="Hytasa">Hytasa</SelectItem>
          <SelectItem value="La Carolina">La Carolina</SelectItem>
          <SelectItem value="Lantejuela">Lantejuela</SelectItem>
          <SelectItem value="Moguer">Moguer</SelectItem>
          <SelectItem value="Osuna">Osuna</SelectItem>
          <SelectItem value="Sanlúcar de Barrameda">
            Sanlúcar de Barrameda
          </SelectItem>
          <SelectItem value="Sevilla">Sevilla</SelectItem>
          <SelectItem value="Utrera">Utrera</SelectItem>
        </SelectContent>
      </Select>
    );
  } else if (filterBy === "position") {
    return (
      <Select
        onValueChange={(value) => {
          table.getColumn("position")?.setFilterValue(value);
        }}
      >
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Seleccione la posición" />
        </SelectTrigger>
        <SelectContent className="max-w-sm">
          <SelectItem value="Carnicería">Carnicería</SelectItem>
          <SelectItem value="Charcutería">Charcutería</SelectItem>
          <SelectItem value="Pescadería">Pescadería</SelectItem>
          <SelectItem value="Frutería">Frutería</SelectItem>
          <SelectItem value="Panadería">Panadería</SelectItem>
          <SelectItem value="Pastelería">Pastelería</SelectItem>
          <SelectItem value="Cajero">Cajero</SelectItem>
          <SelectItem value="Reponedor">Reponedor</SelectItem>
          <SelectItem value="Limpieza">Limpieza</SelectItem>
        </SelectContent>
      </Select>
    );
  } else if (filterBy === "status") {
    return (
      <Select
        value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
        onValueChange={(value) => {
          table.getColumn("status")?.setFilterValue(value);
        }}
      >
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Seleccione el estado" />
        </SelectTrigger>
        <SelectContent className="max-w-sm">
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="reviewed">Revisado</SelectItem>
          <SelectItem value="rejected">Rechazado</SelectItem>
        </SelectContent>
      </Select>
    );
  } else {
    throw new Error("Invalid filterBy value");
  }
}
