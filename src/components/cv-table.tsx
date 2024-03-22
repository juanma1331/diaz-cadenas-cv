import { useQuery } from "react-query";
import { generateColumns, type CVRow } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";

export type CVTableProps = {
  rows: CVRow[];
};

export default function CVTable(props: CVTableProps) {
  const { data } = useQuery(
    "cvs",
    () => fetch("/api/cvs").then((res) => res.json()),
    {
      initialData: props.rows,
    }
  );

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
  return <CVTableRows columns={columns} data={data} />;
}
