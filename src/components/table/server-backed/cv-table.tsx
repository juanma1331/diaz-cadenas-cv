import { useEffect, useRef, useState } from "react";
import { generateColumns, type CVRow } from "./cv-table-columns";
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
  getSortedRowModel,
} from "@tanstack/react-table";
import CVTableSearch from "./cv-table-search";
import CVTableFilters from "./cv-table-filters";
import CVTableStorageUsed from "./cv-table-storage";
import CVTablePagination from "./cv-table-pagination";

dayJS.extend(utc);
dayJS.extend(relativeTime);
dayJS.locale("es");

export default function CVTable() {
  const cursorsRef = useRef<Set<string>>(new Set());
  const [limit, setLimit] = useState<number>(10);
  const [cursor, setCursor] = useState<string>();
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);

  const { data, isLoading, isError } = trpcReact.getAllCVSServer.useQuery({
    pagination: {
      cursor: cursor,
      limit: limit,
    },
    filters: filteringState as {
      id: "place" | "position" | "status";
      value: string;
    }[],
  });

  useEffect(() => {
    if (cursorsRef.current && data?.cursor) {
      cursorsRef.current.add(data.cursor);
    }
  }, [data]);

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
  });

  const handleOnLimitChange = () => console.log("Limit changing");
  const handleOnNextPage = () => {
    const setArr = Array.from(cursorsRef.current);
    const currentCursorIndex = setArr.findIndex((c) => c === cursor);
    const nextCursorIndex = currentCursorIndex + 1;

    if (nextCursorIndex < setArr.length) {
      const nextCursor = setArr[nextCursorIndex];
      setCurrentPageIndex((prev) => prev + 1);
      setCursor(nextCursor);
    }
  };
  const handleOnPrevPage = () => {
    const setArr = Array.from(cursorsRef.current);
    const currentCursorIndex = setArr.findIndex((c) => c === cursor);

    if (currentCursorIndex === 0) {
      setCursor(undefined);
      setCurrentPageIndex(1);
    } else if (currentCursorIndex > 0) {
      const prevCursor = setArr[currentCursorIndex - 1];
      setCurrentPageIndex((prev) => prev - 1);
      setCursor(prevCursor);
    }
  };

  const table = useReactTable({
    columns,
    data: data?.cvs ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    state: {
      sorting: sortingState,
    },
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
            currentPage={currentPageIndex}
            onLimitChange={handleOnLimitChange}
            onPrevPage={handleOnPrevPage}
            onNextPage={handleOnNextPage}
            pages={data.pages}
          />
        )}
      </div>
    </div>
  );
}
