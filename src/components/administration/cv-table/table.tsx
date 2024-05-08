import { useEffect, useMemo, useState } from "react";
import CVTableRows from "./rows";
import { trpcReact } from "@/client";
import {
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  type RowSelectionState,
  type ColumnDef,
} from "@tanstack/react-table";
import { type Search } from "./search";
import CVTablePagination from "./pagination";
import { CVS_STATUS } from "@/constants";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import type {
  CVRow,
  DateFilteringState,
  FilteringState,
  Handlers,
  Loading,
  States,
} from "./types";
import nameColumnDef from "./columns/definitions/name";
import createdAtColumnDef from "./columns/definitions/created-at";
import placeColumnDef from "./columns/definitions/place";
import positionColumnDef from "./columns/definitions/position";
import statusColumnDef from "./columns/definitions/status";
import attachmentsColumnDef from "./columns/definitions/attachments";
import selectionRowColumnDef from "./columns/definitions/selection";
import actionsColumnDef from "./columns/definitions/actions";
import emailColumnDef from "./columns/definitions/email";
import TableFilters, { isOnFilteringState } from "./filtering/filters";
import useDebounce from "@/components/hooks/use-debounce";

export type FilterType = {
  id: "place" | "position" | "status";
  value: string | number;
};

export type SortingType = {
  id: "createdAt" | "name" | "email";
  desc: boolean;
};

const columns: ColumnDef<CVRow>[] = [
  selectionRowColumnDef(),
  nameColumnDef(),
  emailColumnDef(),
  createdAtColumnDef(),
  placeColumnDef(),
  positionColumnDef(),
  statusColumnDef(),
  attachmentsColumnDef(),
  actionsColumnDef(),
];

export type CVTableProps = {
  search: Search | undefined;
};

export default function CVTable({ search }: CVTableProps) {
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    {}
  );
  const [sortingState, setSortingState] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [filteringState, setFilteringState] = useState<FilteringState>([]);
  const [dateFilteringState, setDateFilteringState] =
    useState<DateFilteringState>();

  const debauncedFiltering = useDebounce<FilteringState>(filteringState, 500);
  const debauncedSorting = useDebounce<SortingState>(sortingState, 500);

  const utils = trpcReact.useUtils();

  const queryInput = useMemo(
    () => ({
      pagination: {
        page: page,
        limit: limit,
      },
      filters: debauncedFiltering as FilterType[],
      dateFilters: dateFilteringState,
      sorting: debauncedSorting as [SortingType, ...SortingType[]],
      search: search,
    }),
    [
      page,
      limit,
      debauncedFiltering,
      dateFilteringState,
      debauncedSorting,
      search,
    ]
  );

  const {
    data: cvsData,
    isLoading: isTableDataLoading,
    isError: getAllCVSError,
  } = trpcReact.getAllCVS.useQuery(queryInput, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    mutate: changeStatus,
    isLoading: isChangeStatusLoading,
    isError: changeStatusError,
  } = trpcReact.changeStatus.useMutation({
    onSuccess: (input) => {
      utils.getAllCVS.invalidate(queryInput);

      const { affectedRows, newStatus } = input;

      const message =
        affectedRows > 1
          ? `Has marcado ${affectedRows} CVs como '${newStatus}'`
          : `Has marcado el CV como '${newStatus}'`;
      toast.success(message);
    },
  });

  const {
    mutate: deleteCV,
    isLoading: isDeleteLoading,
    isError: deleteCVError,
  } = trpcReact.delete.useMutation({
    onSuccess: (input) => {
      utils.getAllCVS.invalidate(queryInput);

      const { affectedRows } = input;

      if (input.affectedRows > 1) {
        const message = `Has eliminado ${affectedRows} ${
          affectedRows > 1 ? "CVs" : "CV"
        } y todos sus adjuntos`;
        toast.success(message);
        setRowSelectionState({});
      } else {
        const message = `Has eliminado un CV de y todos sus adjuntos`;
        toast.success(message);
      }
    },
  });

  const handlers: Handlers = {
    onFilter: (f) => {
      if (Array.isArray(f)) {
        const toAdd = f.filter((f) => !isOnFilteringState(f, filteringState));

        setFilteringState((prevFilters) => [...prevFilters, ...toAdd]);
      } else {
        if (!isOnFilteringState(f, filteringState)) {
          setFilteringState((prev) => [...prev, f]);
        }
      }
    },
    onClearFilter: (f) => {
      if (Array.isArray(f)) {
        const toRemoveFilterValues = f
          .filter((f) => isOnFilteringState(f, filteringState))
          .map((f) => f.value);
        setFilteringState((prevFilters) => {
          return prevFilters.filter(
            (f) => !toRemoveFilterValues.includes(f.value)
          );
        });
      } else {
        setFilteringState((prev) =>
          prev.filter(
            (filter) => filter.id !== f.id || filter.value !== f.value
          )
        );
      }
    },
    onDateFilter: (dateFilter) => {
      if (dateFilter.type === "single") {
        setDateFilteringState({
          type: "single",
          date: (dateFilter.value as Date).toISOString(),
        });
      } else {
        const val = dateFilter.value as DateRange;
        setDateFilteringState({
          type: "range",
          from: val.from!.toISOString(),
          to: val.to!.toISOString(),
        });
      }
    },
    onClearDateFilter: () => setDateFilteringState(undefined),
    onSort: (sort) => {
      setSortingState([sort]);
    },
    onCleanSort: () => setSortingState([]),
    onMarkAs: (params) => changeStatus(params),
    onDelete: (ids) => {
      deleteCV({ ids });

      const filtered = Object.entries(rowSelectionState).filter(
        ([key]) => !ids.includes(key)
      );
      setRowSelectionState(Object.fromEntries(filtered));
    },
  };

  const loading: Loading = {
    isTableDataLoading,
    isChangeStatusLoading,
    isDeleteLoading,
  };

  const states: States = {
    filteringState,
    dateFilteringState,
    sortingState,
    rowSelectionState,
  };

  const handleOnLimitChange = (newLimit: number) => {
    setRowSelectionState({});
    setLimit(newLimit);
  };
  const handleOnNextPage = () => {
    setRowSelectionState({});
    setPage((currentPage) => currentPage + 1);
  };
  const handleOnPrevPage = () => {
    setRowSelectionState({});
    setPage((prev) => Math.max(1, prev - 1));
  };
  const handleOnFirstPage = () => {
    setRowSelectionState({});
    setPage(1);
  };
  const handleOnLastPage = () => {
    setRowSelectionState({});
    setPage(cvsData?.lastPage ?? 0);
  };

  const table = useReactTable({
    columns,
    data: cvsData?.cvs ?? [],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelectionState,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      rowSelection: rowSelectionState,
    },
    meta: {
      handlers,
      loading,
      states,
      tableData: cvsData?.cvs ?? [],
    },
  });

  if (getAllCVSError || changeStatusError || deleteCVError) {
    return <div>Error</div>;
  }

  return (
    <div>
      <h1 className="text-foreground text-xl py-3">Currículums</h1>
      <div className="flex items-center px-2 pb-3">
        <TableFilters
          filteringState={filteringState}
          dateFilteringState={dateFilteringState}
          onFilter={handlers.onFilter}
          onDateFilter={handlers.onDateFilter}
          onClearFilter={handlers.onClearFilter}
          onClearDateFilter={handlers.onClearDateFilter}
        />
      </div>
      <div className="space-y-2 border border-border rounded-md">
        <CVTableRows table={table} isLoading={isTableDataLoading} />

        <div className="flex items-center justify-end px-2 pb-2">
          {!isTableDataLoading && (
            <CVTablePagination
              limit={limit}
              currentPage={page}
              lastPage={cvsData.lastPage}
              onLimitChange={handleOnLimitChange}
              onPrevPage={handleOnPrevPage}
              onNextPage={handleOnNextPage}
              onFirstPage={handleOnFirstPage}
              onLastPage={handleOnLastPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
