import { Input } from "../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function CVTableSearch() {
  return (
    <div className="min-w-[400px] relative group">
      <Input className="pl-8" />
      <MagnifyingGlassIcon className="absolute top-1/2 left-2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800" />

      <Select
        value="todos"
        onValueChange={(value) => {
          console.log(value);
        }}
      >
        <SelectTrigger className="h-8 w-[90px] absolute top-1/2 right-2 transform -translate-y-1/2">
          <SelectValue placeholder="Criterio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          <SelectItem value="nombre">Nombre</SelectItem>
          <SelectItem value="email">Email</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
