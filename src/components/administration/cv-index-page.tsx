import { useState } from "react";
import type { OnSearch, Search } from "./cv-table/search";
import CVTable from "./cv-table/table";
import CVIndexPageHeader from "./cv-index-page-header";
import { Toaster } from "sonner";

export default function CVIndexPage() {
  const [search, setSearch] = useState<Search | undefined>();

  const handleOnSearch: OnSearch = (params) => {
    if (params.value === "") {
      setSearch(undefined);
    } else {
      setSearch(params);
    }
  };

  return (
    <>
      <CVIndexPageHeader onSearch={handleOnSearch} />

      <main className="px-6 overflow-hidden">
        <CVTable search={search} />
      </main>

      <Toaster />
    </>
  );
}
