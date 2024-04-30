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
  Actions,
  BatchActions,
  CVRow,
  DateFiltering,
  DateFilteringState,
  Filtering,
  Sorting,
} from "./columns/columns-def/types";
import nameColumnDef from "./columns/columns-def/name";
import createdAtColumnDef from "./columns/columns-def/created-at";
import { placeColumnDef } from "./columns/columns-def/place";
import { positionColumnDef } from "./columns/columns-def/position";
import { statusColumnDef } from "./columns/columns-def/status";
import { attachmentsColumnDef } from "./columns/columns-def/attachments";
import { selectionRowColumnDef } from "./columns/columns-def/selection";
import { actionsColumnDef } from "./columns/columns-def/actions";
import { statusMap } from "@/utils/shared";

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
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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
    isLoading: isCVSDataLoading,
    isError: getAllCVSError,
  } = trpcReact.getAllCVS.useQuery(queryInput, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    mutate: changeStatus,
    isLoading: changeStatusLoading,
    isError: changeStatusError,
  } = trpcReact.changeStatus.useMutation({
    onSuccess: (input) => {
      utils.getAllCVS.invalidate(queryInput);

      if (Array.isArray(input)) {
        const status = statusMap(input[0].newStatus);
        const affectedRows = input.length;
        const message = `Has marcado ${affectedRows} ${
          affectedRows > 1 ? "CVs" : "CV"
        } como '${status}'`;
        toast.success(message);
      } else {
        const { name, newStatus } = input;
        const status = statusMap(newStatus);
        const message = `Has marcado el CV de '${name}' como '${status}'`;
        toast.success(message);
      }
    },
  });

  const {
    mutate: deleteCV,
    isLoading: deleteCVLoading,
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
        setRowSelection({});
      } else {
        const message = `Has eliminado un CV de y todos sus adjuntos`;
        toast.success(message);
      }
    },
  });

  const filtering: Filtering = {
    filteringState: filteringState,
    onFilteringChange: ({ id, value }) => {
      setFilteringState((prevFilters) => {
        const newFilters = prevFilters.filter((f) => f.id !== id);
        if (value) {
          newFilters.push({ id: id, value: value });
        }
        return newFilters;
      });
    },
    onClearFilter: (id) => {
      setFilteringState((prevFilters) => {
        return prevFilters.filter((f) => f.id !== id);
      });
    },
  };

  const dateFiltering: DateFiltering = {
    dateFilteringState: dateFilteringState,
    onCleanDateFiltering: () => setDateFilteringState(undefined),
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
    onSort: (sort) => setSortingState([sort]),
  };

  const sorting: Sorting = {
    sortingState: sortingState,
    onSort: (sort) => {
      setSortingState([sort]);
    },
    onCleanSort: () => {
      setSortingState([]);
    },
  };

  const actions: Actions = {
    onMarkAs: ({ id, name, newStatus }) =>
      changeStatus({ id, name, newStatus }),
    onDelete: (ids) => {
      deleteCV({ ids });

      const id = ids[0]; // We only hace 1 item

      const inSelection = rowSelection[id] !== undefined;

      if (inSelection) {
        const filtered = Object.entries(rowSelection).filter(
          ([key]) => id !== key
        );
        setRowSelection(Object.fromEntries(filtered));
      }
    },
  };

  const batchActions: BatchActions = {
    onMarkAs: (params) => changeStatus([...params]),
    onDelete: (ids) => deleteCV({ ids }),
  };

  const handleOnLimitChange = (newLimit: number) => setLimit(newLimit);
  const handleOnNextPage = () => setPage((currentPage) => currentPage + 1);
  const handleOnPrevPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleOnFirstPage = () => setPage(1);
  const handleOnLastPage = () => setPage(cvsData?.lastPage ?? 0);

  const table = useReactTable({
    columns,
    data: cvsData?.cvs ?? [],
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.id,
    state: {
      rowSelection,
    },
    meta: {
      filtering: filtering,
      sorting: sorting,
      actions: actions,
      batchActions: batchActions,
      isActionColumnLoading: changeStatusLoading || deleteCVLoading,
      dateFiltering: dateFiltering,
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

      <CVTableRows table={table} isLoading={isCVSDataLoading} />

      <div className="flex items-center justify-end px-2 pb-2">
        {!isCVSDataLoading && (
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
