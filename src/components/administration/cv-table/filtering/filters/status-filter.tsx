import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POSITIONS } from "@/constants";
import {
  LandPlot,
  ChevronDown,
  Dot,
  WandSparkles,
  FileCheck2,
} from "lucide-react";

export default function StatusFilter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 data-[state=open]:bg-accent`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <FileCheck2 className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
              <span className="text-slate-800">Estado</span>
            </div>

            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => console.log("filtering")}>
          <Dot className={`mr-2 h-3.5 w-3.5`} />
          Pendiente
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("filtering")}>
          <Dot className={`mr-2 h-3.5 w-3.5`} />
          Revisado
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("filtering")}>
          <Dot className={`mr-2 h-3.5 w-3.5`} />
          Rechazado
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log("filtering")}>
          <Dot className={`mr-2 h-3.5 w-3.5`} />
          Seleccionado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("clear filters")}>
          <WandSparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Limpiar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
