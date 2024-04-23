import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import useDebounce from "@/components/hooks/use-debounce";

export type Search = {
  id: "name" | "email";
  value: string;
};

export type OnSearch = (params: Search) => void;

export type CVTableSearchProps = {
  onSearchChange: OnSearch;
};

type SearchState = "nombre" | "email";

export default function CVTableSearch({ onSearchChange }: CVTableSearchProps) {
  const [searchBy, setSearchBy] = useState<SearchState>("nombre");
  const [search, setSearch] = useState<Search>({ id: "name", value: "" });
  const debaunced = useDebounce<Search>(search, 500);

  useEffect(() => {
    onSearchChange(debaunced);
  }, [debaunced]);

  const handleOnSearch: OnSearch = (params) => {
    setSearch(params);
  };

  return (
    <div className="max-w-[400px] relative">
      {searchBy === "nombre" ? (
        <NameInput onSearchChange={handleOnSearch} />
      ) : (
        <EmailInput onSearchChange={handleOnSearch} />
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
        onSearchChange({ id: "email", value: e.target.value });
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
        onSearchChange({ id: "name", value: e.target.value });
      }}
    />
  );
}
