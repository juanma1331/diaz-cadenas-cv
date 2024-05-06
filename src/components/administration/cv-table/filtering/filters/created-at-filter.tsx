import {
  type DateRange,
  type SelectRangeEventHandler,
  type SelectSingleEventHandler,
} from "react-day-picker";
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
} from "../../types";
import { addDays, format, setDate } from "date-fns";

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
    const dateFormat = "dd/MM/yyyy";

    if (!dateFilteringState) {
      setSingle(undefined);
      setRange(undefined);
      setText("");
      onClearDateFilter();
    }

    if (dateFilteringState?.type === "single") {
      const newDate = new Date(dateFilteringState.date);
      setSingle(newDate);
      onDateFilter({
        type: "single",
        value: newDate,
      });

      setText(format(newDate, dateFormat));
    }

    if (dateFilteringState?.type === "range") {
      const newRange = {
        from: new Date(dateFilteringState.from),
        to: new Date(dateFilteringState.to),
      };
      setRange(newRange);
      onDateFilter({
        type: "range",
        value: newRange,
      });

      setText(
        `Desde ${format(newRange.from, dateFormat)} Hasta ${format(
          newRange.to,
          dateFormat
        )}`
      );
    }
  }, [dateFilteringState]);

  const selectSingleEventHandler: SelectSingleEventHandler = (date) => {
    if (date) {
      onDateFilter({ type: "single", value: date });
    }
  };

  const selectRangeEventHandler: SelectRangeEventHandler = (range) => {
    if (range) setRange(range);
    if (range?.from && range.to) {
      onDateFilter({ type: "range", value: range });
    }
  };

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
          <div className="px-6 py-2 flex items-center justify-between">
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
              onSelect={selectSingleEventHandler}
              initialFocus
            />
          </TabsContent>
          <TabsContent value="range" className="space-y-2">
            <CalendarComponent
              locale={es}
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={selectRangeEventHandler}
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
