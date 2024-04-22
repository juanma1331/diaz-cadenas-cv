import type { Row, Table } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";

export function useTableRowsSelection<T>() {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const onRowSelectionChange = useCallback(
    (row: Row<T>) => (event: React.ChangeEvent<HTMLInputElement>) => {
      row.getToggleSelectedHandler()(event);
      if (!row.getIsSelected()) {
        setSelectedRows((prev) => [...prev, row.original]);
      } else {
        setSelectedRows((prev) => prev.filter((item) => item !== row.original));
      }
    },
    []
  );

  const onAllRowsSelectionChange = useCallback(
    (table: Table<T>) => (event: React.ChangeEvent<HTMLInputElement>) => {
      table.getToggleAllRowsSelectedHandler()(event);
      if (table.getIsAllRowsSelected()) {
        setSelectedRows([]);
      } else {
        setSelectedRows(
          table.getPreSelectedRowModel().rows.map((row) => row.original)
        );
      }
    },
    []
  );

  return {
    selectedRows,
    onRowSelectionChange,
    onAllRowsSelectionChange,
  };
}
