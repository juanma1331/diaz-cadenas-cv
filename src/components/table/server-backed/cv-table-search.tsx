import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type OnSearch = (params: { field: string; search: string }) => void;

export type CVTableSearchProps = {
  onSearchChange: OnSearch;
};

type SearchState = "nombre" | "email";

export default function CVTableSearch({ onSearchChange }: CVTableSearchProps) {
  const [searchBy, setSearchBy] = useState<SearchState>("nombre");

  return (
    <div className="min-w-[400px] relative">
      {searchBy === "nombre" ? (
        <NameInput onSearchChange={onSearchChange} />
      ) : (
        <EmailInput onSearchChange={onSearchChange} />
      )}
      <MagnifyingGlassIcon className="absolute top-1/2 left-2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />

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

type EmailInputProps = {
  onSearchChange: OnSearch;
};
function EmailInput({ onSearchChange }: EmailInputProps) {
  return (
    <Input
      className="pl-8"
      placeholder="Buscar por email"
      aria-label="Buscar por email"
      onChange={(e) => {
        onSearchChange({ field: "email", search: e.target.value });
      }}
    />
  );
}

type NameInputProps = {
  onSearchChange: OnSearch;
};
function NameInput<TData>({ onSearchChange }: NameInputProps) {
  return (
    <Input
      className="pl-8"
      placeholder="Buscar por nombre"
      aria-label="Buscar por nombre"
      onChange={(e) => {
        onSearchChange({ field: "name", search: e.target.value });
      }}
    />
  );
}
