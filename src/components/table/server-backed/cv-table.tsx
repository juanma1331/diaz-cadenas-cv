import { useState } from "react";
import { generateColumns, type CVRow } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";
import { trpcReact } from "@/client";

export default function CVTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = trpcReact.getAllCVS.useQuery({
    pagination: { page: page, limit: limit },
  });

  const columns = generateColumns({
    onSortingChange: (field, direction) => {
      console.log("sorting", { field, direction });
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
    <CVTableRows
      columns={columns}
      data={data?.cvs ?? []}
      isLoading={isLoading}
      pages={data?.pages ?? []}
      page={page}
      limit={limit}
      onPageChage={handlePageChange}
      onLimitChange={handleLimitChange}
    />
  );
}
