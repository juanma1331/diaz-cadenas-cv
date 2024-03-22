import { QueryClient, QueryClientProvider } from "react-query";
import CVTableRows from "./cv-table-rows";
import { type CVRow } from "./cv-table-columns";
import CVTable from "./cv-table";

const queryClient = new QueryClient();

export type CVTableQueryProps = {
  rows: CVRow[];
};

export default function CVTableQuery(props: CVTableQueryProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CVTable rows={props.rows} />
    </QueryClientProvider>
  );
}
