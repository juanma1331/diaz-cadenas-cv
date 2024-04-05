import { useState } from "react";
import {
  generateColumns,
  type Filtering,
  type Sorting,
  type Actions,
} from "./cv-table-columns";
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
} from "@tanstack/react-table";
import CVTableSearch, { type OnSearch, type Search } from "./cv-table-search";
import CVTableFilters from "./cv-table-filters";
import CVTableStorageUsed from "./cv-table-storage";
import CVTablePagination from "./cv-table-pagination";
import { CVSStatus } from "@/types";
import { toast } from "sonner";

dayJS.extend(utc);
dayJS.extend(relativeTime);
dayJS.locale("es");

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
  const [search, setSearch] = useState<Search | undefined>();
  const [sortingState, setSortingState] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [filteringState, setFilteringState] = useState<ColumnFiltersState>([]);
  const utils = trpcReact.useUtils();
  const queryInput = {
    pagination: {
      page: page,
      limit: limit,
    },
    filters: filteringState as FilterType[],
    sorting: sortingState as [SortingType, ...SortingType[]],
    search: search,
  };

  const {
    data,
    isLoading,
    isError: getAllCVSError,
  } = trpcReact.getAllCVS.useQuery(queryInput, {
    queryKey: ["getAllCVS", queryInput],
  });

  const {
    mutate: changeStatus,
    isLoading: changeStatusLoading,
    isError: changeStatusError,
  } = trpcReact.changeStatus.useMutation({
    onMutate: async () => {
      await utils.getAllCVS.cancel(queryInput);
    },
  });

  const {
    mutate: deleteCV,
    isLoading: deleteCVLoading,
    isError: deleteCVError,
  } = trpcReact.delete.useMutation({
    onMutate: async () => {
      await utils.getAllCVS.cancel(queryInput);
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

  const sorting: Sorting = {
    sortingState: sortingState,
    onSortingChange: (sort) => {
      setSortingState([sort]);
    },
    onCleanSort: () => {
      setSortingState([{ id: "createdAt", desc: true }]);
    },
  };

  const actions: Actions = {
    onMarkAsRejected: async (cv) => {
      const query = utils.getAllCVS;

      const prevData = query.getData(queryInput);

      if (!prevData) {
        throw new Error("No prev data");
      }

      const prevCVSIndex = prevData?.cvs.findIndex((c) => c.id === cv.id);

      if (prevCVSIndex === -1) {
        throw new Error("No prev CVS Index");
      }

      const prevCV = prevData?.cvs[prevCVSIndex];

      if (!prevCV) {
        throw new Error("No prev CVS");
      }

      const newCVS = [...prevData?.cvs!];
      const newCV = { ...prevCV, status: CVSStatus.REJECTED };
      newCVS.splice(prevCVSIndex, 1, newCV);

      query.setData(queryInput, { ...prevData!, cvs: newCVS });

      const message = `Has marcado el CV de ${cv.name} como 'Rechazado'`;
      let undone = false;
      toast.success(message, {
        action: {
          label: "Deshacer",
          onClick: () => {
            query.setData(queryInput, { ...prevData });
            undone = true;
          },
        },
        onAutoClose: () => {
          if (undone) return;
          changeStatus({ id: cv.id, newStatus: CVSStatus.REJECTED });
        },
      });
    },
    onMarkAsReviewed: (cv) => {
      const query = utils.getAllCVS;

      const prevData = query.getData(queryInput);

      if (!prevData) {
        throw new Error("No prev data");
      }

      const prevCVSIndex = prevData?.cvs.findIndex((c) => c.id === cv.id);

      if (prevCVSIndex === -1) {
        throw new Error("No prev CVS Index");
      }

      const prevCV = prevData?.cvs[prevCVSIndex];

      if (!prevCV) {
        throw new Error("No prev CVS");
      }

      const newCVS = [...prevData?.cvs!];
      const newCV = { ...prevCV, status: CVSStatus.REVIEWED };
      newCVS.splice(prevCVSIndex, 1, newCV);

      query.setData(queryInput, { ...prevData!, cvs: newCVS });

      const message = `Has marcado el CV de ${cv.name} como 'Revisado'`;
      let undone = false;
      toast.success(message, {
        action: {
          label: "Deshacer",
          onClick: () => {
            query.setData(queryInput, { ...prevData });
            undone = true;
          },
        },
        onAutoClose: () => {
          if (undone) return;
          changeStatus({ id: cv.id, newStatus: CVSStatus.REVIEWED });
        },
      });
    },
    onMarkAsSelected: (cv) => {
      const query = utils.getAllCVS;

      const prevData = query.getData(queryInput);

      if (!prevData) {
        throw new Error("No prev data");
      }

      const prevCVSIndex = prevData?.cvs.findIndex((c) => c.id === cv.id);

      if (prevCVSIndex === -1) {
        throw new Error("No prev CVS Index");
      }

      const prevCV = prevData?.cvs[prevCVSIndex];

      if (!prevCV) {
        throw new Error("No prev CVS");
      }

      const newCVS = [...prevData?.cvs!];
      const newCV = { ...prevCV, status: CVSStatus.SELECTED };
      newCVS.splice(prevCVSIndex, 1, newCV);

      query.setData(queryInput, { ...prevData!, cvs: newCVS });

      const message = `Has marcado el CV de ${cv.name} como 'Seleccionado'`;
      let undone = false;
      toast.success(message, {
        action: {
          label: "Deshacer",
          onClick: () => {
            query.setData(queryInput, { ...prevData });
            undone = true;
          },
        },
        onAutoClose: () => {
          if (undone) return;
          changeStatus({ id: cv.id, newStatus: CVSStatus.SELECTED });
        },
      });
    },
    onDelete: (cv) => {
      const query = utils.getAllCVS;

      const prevData = query.getData(queryInput);

      if (!prevData) {
        throw new Error("No prev data");
      }

      const newCVS = prevData?.cvs.filter((c) => c.id !== cv.id);

      if (!newCVS) {
        throw new Error("No new CVS");
      }

      query.setData(queryInput, { ...prevData!, cvs: newCVS });

      const message = `Has eliminado el CV de ${cv.name}`;
      let undone = false;
      toast.success(message, {
        action: {
          label: "Deshacer",
          onClick: () => {
            query.setData(queryInput, { ...prevData });
            undone = true;
          },
        },
        onAutoClose: () => {
          if (undone) return;
          deleteCV({ id: cv.id });
        },
      });
    },
  };

  const columns = generateColumns({ sorting, filtering, actions });

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
  const handleOnLastPage = () => setPage(data?.pages.length!);

  const table = useReactTable({
    columns,
    data: data?.cvs ?? [],
    getCoreRowModel: getCoreRowModel(),
  });

  if (getAllCVSError || changeStatusError) {
    return <div>Error</div>;
  }

  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between">
        <CVTableSearch onSearchChange={handleOnSearch} />

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
