import { columns } from "./cv-table-columns";
import CVTableRows from "./cv-table-rows";
import { trpcReact } from "@/client";

export default function CVTable() {
  const { data, isLoading, isError } = trpcReact.getAllCVS.useQuery();

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <CVTableRows
      columns={columns}
      data={data?.cvs ?? []}
      isLoading={isLoading}
      storageUsed={data?.storageUsed ?? 0}
    />
  );
}
