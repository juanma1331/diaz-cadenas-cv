import { QueryClient, QueryClientProvider } from "react-query";
import CVTable from "./cv-table";
import { columns, type CVRow } from "./cv-table-columns";

export type CVTableQueryProps = {
  rows: CVRow[];
};

const queryClient = new QueryClient();

export default function CVTableQuery(props: CVTableQueryProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CVTable columns={columns} data={props.rows} />
    </QueryClientProvider>
  );
}
