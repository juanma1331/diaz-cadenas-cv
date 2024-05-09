import { type DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import type {
  DateFilteringState,
  OnClearDateFilter,
  OnDateFilter,
} from "@/components/administration/cv-table/types";
import { format } from "date-fns";

const DATE_FORMAT = "dd/MM/yyyy";

export type DateFilteringColumnHeaderProps = {
  dateFilteringState: DateFilteringState;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
};

export default function CreatedAtFilter({
  dateFilteringState,
  onDateFilter,
  onClearDateFilter,
}: DateFilteringColumnHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [single, setSingle] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (single) {
      setRange(undefined);
      onClearDateFilter();
      onDateFilter({ type: "single", value: single });
      setText(format(single, DATE_FORMAT));
    }
  }, [single]);

  useEffect(() => {
    if (range && range.from && range.to) {
      setSingle(undefined);
      onClearDateFilter();
      onDateFilter({ type: "range", value: range });
      setText(
        `Desde ${format(range.from, DATE_FORMAT)} hasta ${format(
          range.to,
          DATE_FORMAT
        )}`
      );
    }
  }, [range]);

  function handleCleanAll() {
    setRange(undefined);
    setSingle(undefined);
    onClearDateFilter();
  }

  function handleCleanAllAndClose() {
    handleCleanAll();
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {dateFilteringState === undefined ? (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-slate-800" />
                <span className="text-slate-800">Recibido</span>
              </div>
              {open ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-primary bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
            onClick={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                <span className="truncate max-w-90">Recibido: {text}</span>
              </div>

              {open ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-fit p-0"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="bg-muted/50">
          <div className="px-6 py-3 flex items-center justify-between">
            <p>Recibido</p>

            <Button
              variant="link"
              size="icon"
              type="button"
              className="h-5 w-5"
              disabled={dateFilteringState === undefined}
              onClick={handleCleanAllAndClose}
            >
              <Trash2 className="h-3.5 w-3.5 text-slate-800" />
            </Button>
          </div>
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
        </div>
        <Tabs defaultValue={getDefaultOpenTab(dateFilteringState)}>
          <TabsList className="bg-background mt-4 space-x-2 px-4">
            <TabsTrigger
              value="single"
              className="border border-border rounded-2xl data-[state=active]:border-primary data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Calendar className="mr-2 h-3.5 w-3.5" />
              Fecha
            </TabsTrigger>
            <TabsTrigger
              value="range"
              className="border border-border rounded-2xl data-[state=active]:border-primary data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
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
          </TabsContent>
        </Tabs>

        <div className="bg-muted/70">
          <DropdownMenuSeparator className="m-0 bg-gray-200" />
          <div className="px-6 py-4">
            <Button
              type="button"
              className="p-0 h-fit"
              variant="link"
              disabled={dateFilteringState === undefined}
              onClick={handleCleanAll}
            >
              Limpiar Selección
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getDefaultOpenTab(state: DateFilteringState) {
  if (!state) return "single";
  if (state.type === "single") return "single";

  return "range";
}
