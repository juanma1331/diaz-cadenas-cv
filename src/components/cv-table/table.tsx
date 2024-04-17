import { useState } from "react";
import {
  generateColumns,
  type Filtering,
  type GenerateColumnsParams,
  type DateFiltering,
  type Sorting,
  type Actions,
  type DateFilteringState,
  type BatchActions,
} from "./columns";
import CVTableRows from "./rows";
import { trpcReact } from "@/client";
import {
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  type RowSelectionState,
} from "@tanstack/react-table";
import CVTableSearch, { type OnSearch, type Search } from "./search";
import CVTableFilters from "./filters";
import CVTableStorageUsed from "./storage";
import CVTablePagination from "./pagination";
import { CVSStatus } from "@/constants";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

type FilterType = {
  id: "place" | "position" | "status";
  value: string | number;
};
type SortingType = {
  id: "createdAt" | "name" | "email";
  desc: boolean;
};

export default function CVTable() {
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState<Search | undefined>();
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);
  const [dateFilteringState, setDateFilteringState] =
    useState<DateFilteringState>();

  const utils = trpcReact.useUtils();
  const queryInput = {
    pagination: {
      page: page,
      limit: limit,
    },
    filters: filteringState as FilterType[],
    dateFilters: dateFilteringState,
    sorting: sortingState as [SortingType, ...SortingType[]],
    search: search,
  };

  const {
    data: cvsData,
    isLoading,
    isError: getAllCVSError,
  } = trpcReact.getAllCVS.useQuery(queryInput);

  const { data: storageInUseData, isError: getStorageInUseError } =
    trpcReact.getStorageInUse.useQuery();

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

      if (Array.isArray(input)) {
        const affectedRows = input.length;
        const message = `Has eliminado ${affectedRows} ${
          affectedRows > 1 ? "CVs" : "CV"
        } y todos sus adjuntos`;
        toast.success(message);
        setRowSelection({});
      } else {
        const { name } = input;
        const message = `Has eliminado el CV de '${name}' y todos sus adjuntos`;
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
    onMarkAsPending: (cv) => {
      changeStatus({ id: cv.id, name: cv.name, newStatus: CVSStatus.PENDING });
    },
    onMarkAsRejected: (cv) => {
      changeStatus({ id: cv.id, name: cv.name, newStatus: CVSStatus.REJECTED });
    },
    onMarkAsReviewed: (cv) => {
      changeStatus({ id: cv.id, name: cv.name, newStatus: CVSStatus.REVIEWED });
    },
    onMarkAsSelected: (cv) => {
      changeStatus({ id: cv.id, name: cv.name, newStatus: CVSStatus.SELECTED });
    },
    onDelete: (cv) => {
      deleteCV({ id: cv.id, name: cv.name });
    },
  };

  const batchActions: BatchActions = {
    onMarkAsPending: (cvs) =>
      changeStatus(
        cvs.map((c) => ({
          id: c.id,
          name: c.name,
          newStatus: CVSStatus.PENDING,
        }))
      ),
    onMarkAsRejected: (cvs) =>
      changeStatus(
        cvs.map((c) => ({
          id: c.id,
          name: c.name,
          newStatus: CVSStatus.REJECTED,
        }))
      ),
    onMarkAsReviewed: (cvs) =>
      changeStatus(
        cvs.map((c) => ({
          id: c.id,
          name: c.name,
          newStatus: CVSStatus.REVIEWED,
        }))
      ),
    onMarkAsSelected: (cvs) =>
      changeStatus(
        cvs.map((c) => ({
          id: c.id,
          name: c.name,
          newStatus: CVSStatus.SELECTED,
        }))
      ),
    onDelete: (cvs) => deleteCV(cvs.map((c) => ({ id: c.id, name: c.name }))),
  };

  const columns = generateColumns({
    sorting,
    filtering,
    actions,
    batchActions,
    dateFiltering,
    isActionColumnLoading: changeStatusLoading || deleteCVLoading,
  });

  const handleOnSearch: OnSearch = (params) => {
    if (params.value === "") {
      setSearch(undefined);
    } else {
      setSearch(params);
    }
  };

  const handleOnLimitChange = (newLimit: number) => setLimit(newLimit);
  const handleOnNextPage = () => setPage((currentPage) => currentPage + 1);
  const handleOnPrevPage = () => setPage((currentPage) => currentPage - 1);
  const handleOnFirstPage = () => setPage(1);
  const handleOnLastPage = () => setPage(cvsData?.pages.length!);

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
  });

  if (
    getAllCVSError ||
    changeStatusError ||
    getStorageInUseError ||
    deleteCVError
  ) {
    return <div>Error</div>;
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <CVTableSearch onSearchChange={handleOnSearch} />

        <div className="flex items-center space-x-2">
          <CVTableFilters
            filteringState={filteringState}
            dateFilteringState={dateFilteringState}
            sortingState={sortingState}
            setFilters={setFilteringState}
            setDateFilters={setDateFilteringState}
            setSorting={setSortingState}
          />
          <CVTableStorageUsed
            storageUsed={storageInUseData?.storageInUse ?? 0}
          />
        </div>
      </div>

      <CVTableRows table={table} isLoading={isLoading} />

      <div className="flex items-center justify-end px-2">
        {!isLoading && (
          <CVTablePagination
            limit={limit}
            currentPage={page}
            onLimitChange={handleOnLimitChange}
            onPrevPage={handleOnPrevPage}
            onNextPage={handleOnNextPage}
            onFirstPage={handleOnFirstPage}
            onLastPage={handleOnLastPage}
            pages={cvsData.pages}
          />
        )}
      </div>
    </div>
  );
}

function statusMap(status: number): string {
  switch (status) {
    case CVSStatus.PENDING:
      return "Pendiente";
    case CVSStatus.REJECTED:
      return "Reachazado";
    case CVSStatus.REVIEWED:
      return "Revisado";
    case CVSStatus.SELECTED:
      return "Seleccionado";
    default:
      throw new Error("Invalid status");
  }
}