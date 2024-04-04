import { useState } from "react";
import { generateColumns } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";
import { trpcReact } from "@/client";
import dayJS from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import {
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  getCoreRowModel,
  type ColumnSort,
} from "@tanstack/react-table";
import CVTableSearch from "./cv-table-search";
import CVTableFilters from "./cv-table-filters";
import CVTableStorageUsed from "./cv-table-storage";
import CVTablePagination from "./cv-table-pagination";

dayJS.extend(utc);
dayJS.extend(relativeTime);
dayJS.locale("es");

export default function CVTable() {
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortingState, setSortingState] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);

  const { data, isLoading, isError } = trpcReact.getAllCVSServer.useQuery({
    pagination: {
      page: page,
      limit: limit,
    },
    filters: filteringState as {
      id: "place" | "position" | "status";
      value: string;
    }[],
    sorting: sortingState as [
      { id: "createdAt" | "name" | "email"; desc: boolean },
      ...{ id: "createdAt" | "name" | "email"; desc: boolean }[]
    ],
  });

  const columns = generateColumns({
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
    sortingState: sortingState,
    onSortingChange: (sort) => {
      setSortingState([sort]);
    },
    onCleanSort: () => {
      setSortingState([{ id: "createdAt", desc: true }]);
    },
  });

  const handleOnLimitChange = (newLimit: number) => setLimit(newLimit);
  const handleOnNextPage = () => setPage((currentPage) => currentPage + 1);
  const handleOnPrevPage = () => setPage((currentPage) => currentPage - 1);
  const handleOnFirstPage = () => setPage(1);
  const handleOnLastPage = () => setPage(data?.pages.length!);

  const table = useReactTable({
    columns,
    data: data?.cvs ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <CVTableSearch
          onSearchChange={(params) => console.log("Searching for ", params)}
        />

        <div className="flex items-center space-x-2">
          <CVTableFilters
            filters={filteringState}
            setFilters={setFilteringState}
          />
          <CVTableStorageUsed storageUsed={0} />
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
            pages={data.pages}
          />
        )}
      </div>
    </div>
  );
}
