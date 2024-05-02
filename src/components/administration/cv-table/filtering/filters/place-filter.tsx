import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { POSITIONS } from "@/constants";
import { LandPlot, ChevronDown, Dot, WandSparkles } from "lucide-react";

export default function PlaceFilter() {
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
              <LandPlot className="h-3.5 w-3.5 mr-1.5 text-slate-800" />
              <span className="text-slate-800">Ubicación</span>
            </div>

            <ChevronDown className="h-3.5 w-3.5" />
          </div>
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
