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
import CVTableFilters from "./filters";
import CVTablePagination from "./pagination";
import { CVS_STATUS } from "@/constants";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import type {
  CVRow,
  DateFilteringState,
  Handlers,
  Loading,
  States,
} from "./types";
import nameColumnDef from "./columns/definitions/name";
import createdAtColumnDef from "./columns/definitions/created-at";
import { placeColumnDef } from "./columns/definitions/place";
import { positionColumnDef } from "./columns/definitions/position";
import { statusColumnDef } from "./columns/definitions/status";
import { attachmentsColumnDef } from "./columns/definitions/attachments";
import { selectionRowColumnDef } from "./columns/definitions/selection";
import { actionsColumnDef } from "./columns/definitions/actions";
import { statusMap } from "@/utils/shared";
import emailColumnDef from "./columns/definitions/email";

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
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);
  const [dateFilteringState, setDateFilteringState] =
    useState<DateFilteringState>();

  const utils = trpcReact.useUtils();

  const queryInput = useMemo(
    () => ({
      pagination: {
        page: page,
        limit: limit,
      },
      filters: filteringState as FilterType[],
      dateFilters: dateFilteringState,
      sorting: sortingState as [SortingType, ...SortingType[]],
      search: search,
    }),
    [page, limit, filteringState, dateFilteringState, sortingState, search]
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
    onFilter: ({ id, value }) => {
      setFilteringState((prevFilters) => {
        const newFilters = prevFilters.filter((f) => f.id !== id);
        if (value) {
          newFilters.push({ id: id, value: value });
        }
        return newFilters;
      });
    },
    onClearFilter: (id) =>
      setFilteringState((prevFilters) => {
        return prevFilters.filter((f) => f.id !== id);
      }),
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
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <h1 className="text-slate-800 text-xl py-4">Currículums</h1>
        <CVTableFilters
          filteringState={filteringState}
          dateFilteringState={dateFilteringState}
          sortingState={sortingState}
          setFilters={setFilteringState}
          setDateFilters={setDateFilteringState}
          setSorting={setSortingState}
        />
      </div>

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
  );
}
