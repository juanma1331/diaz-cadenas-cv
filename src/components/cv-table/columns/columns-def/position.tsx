import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, Filtering } from "./types";
import { PositionFilteringColumnHeader } from "../headers/position-filtering-column-header";

export type PositionColumnDefProps = {
  filtering: Filtering;
};
export function positionColumnDef({
  filtering,
}: PositionColumnDefProps): ColumnDef<CVRow> {
  return {
    accessorKey: "position",
    header: () => {
      return (
        <PositionFilteringColumnHeader
          filteringState={filtering.filteringState}
          onFilter={filtering.onFilteringChange}
          onClearFilter={filtering.onClearFilter}
        />
      );
    },
  };
}
