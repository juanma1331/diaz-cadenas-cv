import { type DateRange } from "react-day-picker";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter, Calendar, CalendarDays, ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import type { OnDateFilter, OnSort } from "../columns-def/types";

export type DateFilteringColumnHeaderProps = {
  onDateFilter: OnDateFilter;
  onSort: OnSort;
};
export function DateFilteringColumnHeader({
  onDateFilter,
  onSort,
}: DateFilteringColumnHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [single, setSingle] = useState<Date>();
  const [range, setRange] = useState<DateRange | undefined>();

  const handleOnDateFilter = (type: "single" | "range") => {
    if (type === "single") {
      if (!single) throw new Error("Single date undefined");
      onDateFilter({ type: "single", value: single });
    }

    if (type === "range") {
      if (!range) throw new Error("Range date undefined");
      onDateFilter({ type: "range", value: range });
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`-ml-3 h-8 data-[state=open]:bg-accent`}
        >
          <span>Enviado</span>
          <ListFilter className={`h-3.5 w-3.5 ml-2`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-fit">
        <Tabs
          defaultValue="single"
          onValueChange={(val) => {
            if (val === "desc") {
              onSort({ id: "createdAt", desc: false });
              setOpen(false);
            }
          }}
        >
          <TabsList>
            <TabsTrigger value="single">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Fecha
            </TabsTrigger>
            <TabsTrigger value="range">
              <CalendarDays className="mr-2 h-3.5 w-3.5" />
              Rango
            </TabsTrigger>
            <TabsTrigger value="desc">
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5" />
              Asc
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
            {single && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOnDateFilter("single")}
              >
                Aplicar
              </Button>
            )}
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
            {range && range.to && range.from && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleOnDateFilter("range")}
              >
                Aplicar
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
