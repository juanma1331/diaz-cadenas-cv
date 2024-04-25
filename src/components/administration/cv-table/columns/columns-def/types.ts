import type {
  ColumnFilter,
  ColumnFiltersState,
  ColumnSort,
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

export type Filtering = {
  filteringState: ColumnFiltersState;
  onFilteringChange: OnFilter;
  onClearFilter: OnClearFilter;
};

export type OnSort = (sort: ColumnSort) => void;
export type OnCleanSort = (id: string) => void;

export type Sorting = {
  sortingState: SortingState;
  onSort: OnSort;
  onCleanSort: OnCleanSort;
};

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

export type OnDateFilter = (filter: {
  type: "single" | "range";
  value: Date | DateRange;
}) => void;

export type DateFiltering = {
  onDateFilter: OnDateFilter;
  onSort: OnSort;
  onCleanDateFiltering: () => void;
  dateFilteringState: DateFilteringState;
};

export type SingleAction = (cv: CVRow) => void;
export type BatchAction = (cvs: CVRow[]) => void;

export type Actions = {
  onMarkAsReviewed: SingleAction;
  onMarkAsRejected: SingleAction;
  onMarkAsSelected: SingleAction;
  onMarkAsPending: SingleAction;
  onDelete: SingleAction;
};

export type BatchActions = {
  onMarkAsReviewed: BatchAction;
  onMarkAsRejected: BatchAction;
  onMarkAsSelected: BatchAction;
  onMarkAsPending: BatchAction;
  onDelete: BatchAction;
};