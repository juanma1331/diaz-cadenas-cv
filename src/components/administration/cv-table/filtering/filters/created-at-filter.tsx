import { type DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListFilter,
  Calendar,
  CalendarDays,
  ArrowUpIcon,
  WandSparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import type {
  DateFilteringState,
  OnClearDateFilter,
  OnDateFilter,
  OnSort,
} from "../../types";
import { addDays } from "date-fns";

export type DateFilteringColumnHeaderProps = {
  dateFilteringState: DateFilteringState;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
  onSort: OnSort;
};
export default function CreatedAtFilter({
  dateFilteringState,
  onDateFilter,
  onClearDateFilter,
  onSort,
}: DateFilteringColumnHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [single, setSingle] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();

  useEffect(() => {
    switch (dateFilteringState?.type) {
      case "single":
        setRange(undefined);
        setSingle(new Date(dateFilteringState.date));
        break;
      case "range":
        setSingle(undefined);
        setRange({
          from: new Date(dateFilteringState.from),
          to: addDays(new Date(dateFilteringState.to), 20),
        });
        break;
      default:
        setSingle(undefined);
        setRange(undefined);
    }
  }, [dateFilteringState]);

  function handleOnDateFilter(type: "single" | "range") {
    if (type === "single") {
      if (!single) throw new Error("Single date undefined");
      onDateFilter({ type: "single", value: single });
    }

    if (type === "range") {
      if (!range) throw new Error("Range date undefined");
      onDateFilter({ type: "range", value: range });
    }

    setOpen(false);
  }

  function handleOnClean() {
    onClearDateFilter();
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 data-[state=open]:bg-accent`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
              <span className="text-slate-800">Recibido</span>
            </div>

            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit">
        <Tabs
          defaultValue="single"
          className=""
          onValueChange={(val) => {
            if (val === "desc") {
              onSort({ id: "createdAt", desc: false });
              setOpen(false);
            }
          }}
        >
          <TabsList className="ml-3">
            <TabsTrigger value="single">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Fecha
            </TabsTrigger>
            <TabsTrigger value="range">
              <CalendarDays className="mr-2 h-3.5 w-3.5" />
              Rango
            </TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="space-y-2">
            <CalendarComponent
              locale={es}
              mode="single"
              selected={single}
              onSelect={setSingle}
              initialFocus
            />
          </TabsContent>
          <TabsContent value="range" className="space-y-2">
            <CalendarComponent
              locale={es}
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
            />
            <div className="flex items-center justify-center pb-5">
              {range &&
                range.to &&
                range.from &&
                dateFilteringState?.type !== "range" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOnDateFilter("range")}
                  >
                    Aplicar
                  </Button>
                )}

              {range &&
                range.to &&
                range.from &&
                dateFilteringState?.type === "range" && (
                  <Button variant="outline" size="sm" onClick={handleOnClean}>
                    <WandSparkles className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
