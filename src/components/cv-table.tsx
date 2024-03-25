import { useQuery } from "react-query";
import { generateColumns, type CVRow } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";
import { trpcReact } from "@/client";

export default function CVTable() {
  const { data, isLoading, isError } = trpcReact.getAllCVS.useQuery();

  const columns = generateColumns({
    onSortingChange: (field, direction) => {
      console.log("sorting", { field, direction });
    },
    onFilterChange: (field, value) => {
      console.log("filter", { field, value });
    },
    onPaginationChange: (page) => {
      console.log("pagination", { page });
    },
  });

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <CVTableRows
      columns={columns}
      data={data?.cvs ?? []}
      isLoading={isLoading}
    />
  );
}
