import type {
  ColumnFilter,
  ColumnFiltersState,
  ColumnSort,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

export type RowAttachment = {
  url: string;
  type: string;
  name: string;
};

export type CVRow = {
  id: string;
  name: string;
  email: string;
  place: string;
  position: string;
  status: number;
  createdAt: string;
  attachments: RowAttachment[];
};

export type OnFilter = (filter: ColumnFilter) => void;
export type OnClearFilter = (id: string) => void;
export type OnSort = (sort: ColumnSort) => void;
export type OnCleanSort = (id: string) => void;
export type OnDateFilter = (filter: {
  type: "single" | "range";
  value: Date | DateRange;
}) => void;
export type OnClearDateFilter = () => void;
export type OnMark = ({
  ids,
  newStatus,
}: {
  ids: Array<string>;
  newStatus: number;
}) => void;
export type OnDelete = (ids: Array<string>) => void;

export type DateFilteringState =
  | {
      type: "single";
      date: string;
    }
  | {
      type: "range";
      from: string;
      to: string;
    }
  | undefined;

export type Handlers = {
  onFilter: OnFilter;
  onClearFilter: OnClearFilter;
  onDateFilter: OnDateFilter;
  onClearDateFilter: OnClearDateFilter;
  onSort: OnSort;
  onCleanSort: OnCleanSort;
  onMarkAs: OnMark;
  onDelete: OnDelete;
};

export type States = {
  filteringState: ColumnFiltersState;
  sortingState: SortingState;
  dateFilteringState: DateFilteringState;
  rowSelectionState: RowSelectionState;
};

export type Loading = {
  isTableDataLoading: boolean;
  isChangeStatusLoading: boolean;
  isDeleteLoading: boolean;
};
