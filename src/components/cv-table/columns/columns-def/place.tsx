import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, Filtering } from "./types";
import { PlaceFilteringColumnHeader } from "../headers/place-filtering-column-header";

export type PlaceColumnDefProps = {
  filtering: Filtering;
};
export function placeColumnDef({
  filtering,
}: PlaceColumnDefProps): ColumnDef<CVRow> {
  return {
    accessorKey: "place",
    header: () => {
      return (
        <PlaceFilteringColumnHeader
          filteringState={filtering.filteringState}
          onFilter={filtering.onFilteringChange}
          onClearFilter={filtering.onClearFilter}
        />
      );
    },
  };
}
