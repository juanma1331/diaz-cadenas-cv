import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

import { type Table as TableType } from "@tanstack/react-table";

type SearchState = "nombre" | "email";

export type CVTableSearchProps<TData> = {
  table: TableType<TData>;
};

export default function CVTableSearch<TData>({
  table,
}: CVTableSearchProps<TData>) {
  const [searchBy, setSearchBy] = useState<SearchState>("nombre");

  return (
    <div className="min-w-[400px] relative group">
      {searchBy === "nombre" ? (
        <NameInput table={table} />
      ) : (
        <EmailInput table={table} />
      )}
      <MagnifyingGlassIcon className="absolute top-1/2 left-2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800" />

      <Select
        value={searchBy}
        onValueChange={(value) => {
          setSearchBy(value as SearchState);
        }}
      >
        <SelectTrigger className="h-8 w-[100px] absolute top-1/2 right-2 transform -translate-y-1/2">
          <SelectValue placeholder="Criterio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nombre">Nombre</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type EmailInputProps<TData> = {
  table: TableType<TData>;
};
function EmailInput<TData>({ table }: EmailInputProps<TData>) {
  return (
    <Input
      className="pl-8"
      placeholder="Buscar por email"
      aria-label="Buscar por email"
      value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
      onChange={(e) => {
        table.getColumn("email")?.setFilterValue(e.target.value);
      }}
    />
  );
}

type NameInputProps<TData> = {
  table: TableType<TData>;
};
function NameInput<TData>({ table }: NameInputProps<TData>) {
  return (
    <Input
      className="pl-8"
      placeholder="Buscar por nombre"
      aria-label="Buscar por nombre"
      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
      onChange={(e) => {
        table.getColumn("name")?.setFilterValue(e.target.value);
      }}
    />
  );
}
