import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POSITIONS } from "@/constants";
import { Dot, Filter, ListFilter, WandSparkles } from "lucide-react";

export default function TableFilters() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-sm font-bold">Filtros</span>
      </div>

      <div>
        <PositionFilter />
      </div>
    </div>
  );
}

function PositionFilter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 data-[state=open]:bg-accent`}
        >
          <span className="text-slate-800">Puesto</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2 text-slate-800`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {POSITIONS.map((position, i) => (
          <DropdownMenuItem
            key={`dropdown-filter-${position}-${i}`}
            onClick={() => console.log("adding filter")}
          >
            <Dot />
            {position}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("clearing filter")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
