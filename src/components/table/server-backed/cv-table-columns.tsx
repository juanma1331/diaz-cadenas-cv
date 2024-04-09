import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSort,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog";

import { FileDown, FileText, MoreHorizontal, Video } from "lucide-react";

import {
  SortingColumnHeader,
  type OnSort,
  PositionFilteringColumnHeader,
  type OnFilter,
  PlaceFilteringColumnHeader,
  StatusFilteringColumnHeader,
  type OnCleanSort,
  type OnClearFilter,
  DateFilteringColumnHeader,
  type OnDateFilter,
} from "./cv-table-column";
import { CVSStatus } from "@/types";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import CreatedAtCell from "./cv-table-cells";

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

export type Filtering = {
  filteringState: ColumnFiltersState;
  onFilteringChange: OnFilter;
  onClearFilter: OnClearFilter;
};

export type Sorting = {
  sortingState: SortingState;
  onSort: OnSort;
  onCleanSort: OnCleanSort;
};

export type DateFiltering = {
  onDateFilter: OnDateFilter;
  onSort: OnSort;
};

export type Actions = {
  onMarkAsReviewed: (cv: CVRow) => void;
  onMarkAsRejected: (cv: CVRow) => void;
  onMarkAsSelected: (cv: CVRow) => void;
  onDelete: (cv: CVRow) => void;
};

export type GenerateColumnsParams = {
  filtering: Filtering;
  dateFiltering: DateFiltering;
  sorting: Sorting;
  actions: Actions;
};

export function generateColumns({
  filtering,
  dateFiltering,
  sorting,
  actions,
}: GenerateColumnsParams): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    {
      accessorKey: "name",
      header: () => {
        return (
          <SortingColumnHeader
            id="name"
            title="Nombre"
            isDesc={isDesc(sorting.sortingState, "name")}
            isSorting={isSorting(sorting.sortingState, "name")}
            onSort={sorting.onSort}
            onCleanSort={sorting.onCleanSort}
          />
        );
      },
    },
    {
      accessorKey: "email",
      header: () => {
        return (
          <SortingColumnHeader
            id="email"
            title="Email"
            isDesc={isDesc(sorting.sortingState, "email")}
            isSorting={isSorting(sorting.sortingState, "email")}
            onSort={sorting.onSort}
            onCleanSort={sorting.onCleanSort}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => {
        return (
          <DateFilteringColumnHeader
            onDateFilter={dateFiltering.onDateFilter}
            onSort={dateFiltering.onSort}
          />
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;

        return <CreatedAtCell createdAt={createdAt} />;
      },
    },
    {
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
    },
    {
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
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <StatusFilteringColumnHeader
            filteringState={filtering.filteringState}
            onFilter={filtering.onFilteringChange}
            onClearFilter={filtering.onClearFilter}
          />
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as CVRow["status"];
        let badgeColor = "";
        let badgeText = "";

        switch (status) {
          case CVSStatus.PENDING:
            badgeColor =
              "bg-yellow-300 text-yellow-900 hover:bg-yellow-300/80 hover:text-yellow-900";
            badgeText = "Pendiente";
            break;

          case CVSStatus.REVIEWED:
            badgeColor =
              "bg-green-300 text-green-900 hover:bg-green-300/80 hover:text-green-900";
            badgeText = "Revisado";
            break;
          case CVSStatus.REJECTED:
            badgeColor =
              "bg-red-300 text-red-900 hover:bg-red-300/80 hover:text-red-900";
            badgeText = "Rechazado";
            break;
          case CVSStatus.SELECTED:
            badgeColor =
              "bg-blue-300 text-blue-900 hover:bg-blue-300/80 hover:text-blue-900";
            badgeText = "Seleccionado";
            break;
          default:
            throw new Error("Invalid status");
        }

        return <Badge className={badgeColor}>{badgeText}</Badge>;
      },
    },
    {
      accessorKey: "attachments",
      header: "Adjuntos",
      cell: ({ row }) => {
        const attachments = row.getValue("attachments") as RowAttachment[];
        return (
          <div className="flex justify-center gap-2" key={"random key"}>
            {attachments.map((att, i) => {
              const isPdf = att.type.includes("application/pdf");
              const isVideo = att.type.includes("video/mp4");
              if (!isPdf && !isVideo)
                throw new Error("Invalid attachment type");

              if (isPdf) {
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-normal"
                    key={`attachment-header-${att.type}`}
                    asChild
                  >
                    <a
                      href="https://pdfobject.com/pdf/sample.pdf"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                );
              }

              if (isVideo) {
                return (
                  <AlertDialog key={`attachment-header-${att.type}`}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-normal"
                        asChild
                      >
                        <a href="#" className="flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <video
                        className="rounded-md"
                        width={1280}
                        height={720}
                        controls
                      >
                        <source
                          src="https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
                          type="video/mp4"
                        />
                      </video>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cerrar</AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                );
              }

              return null;
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                {row.original.status !== CVSStatus.REVIEWED && (
                  <DropdownMenuItem
                    onClick={() => actions.onMarkAsReviewed(row.original)}
                  >
                    Marcar como revisado
                  </DropdownMenuItem>
                )}

                {row.original.status !== CVSStatus.REJECTED && (
                  <DropdownMenuItem
                    onClick={() => actions.onMarkAsRejected(row.original)}
                  >
                    Marcar como rechazado
                  </DropdownMenuItem>
                )}

                {row.original.status !== CVSStatus.SELECTED && (
                  <DropdownMenuItem
                    onClick={() => actions.onMarkAsSelected(row.original)}
                  >
                    Marcar como seleccionado
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500">
                    Eliminar
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no puede deshacerse. Esto eliminará
                  permanentemente el CV y sus adjuntos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  {/* TODO: Fix this */}
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => actions.onDelete(row.original)}
                  >
                    Eliminar
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  return columns;
}

function isDesc(sortingState: SortingState, id: "name" | "email") {
  return sortingState.some((s) => s.id === id && s.desc === true);
}

function isSorting(sortingState: SortingState, id: "name" | "email") {
  return sortingState.some((s) => s.id === id);
}
