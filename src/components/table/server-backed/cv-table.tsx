import { useState } from "react";
import { generateColumns, type CVRow } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";
import { trpcReact } from "@/client";
import dayJS from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import CVTableSearch from "./cv-table-search";
import CVTableFilters from "./cv-table-filters";
import CVTableVisibilityToggler from "./cv-table-visibility-toggler";
import CVTableStorageUsed from "./cv-table-storage";
import CVTablePagination from "./cv-table-pagination";

dayJS.extend(utc);
dayJS.extend(relativeTime);
dayJS.locale("es");

export default function CVTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);

  const { data, isLoading, isError } = trpcReact.getAllCVSServer.useQuery({
    pagination: { page: page, limit: limit },
  });

  const columns = generateColumns({
    sortingState: sortingState,
    onSortingChange: ({ id, desc }) => {
      setSortingState([{ id: id, desc: desc }]);
    },
    onCleanSort: (id) => {
      setSortingState((prevSortingState) => {
        return prevSortingState.filter((s) => s.id !== id);
      });
    },
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

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

      <CVTableRows
        columns={columns}
        data={data?.cvs ?? []}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-end px-2">
        {!isLoading && (
          <CVTablePagination
            limit={limit}
            onLimitChange={handlePageChange}
            onPageChange={handleLimitChange}
            page={page}
            pages={data.pages}
          />
        )}
      </div>
    </div>
  );
}
