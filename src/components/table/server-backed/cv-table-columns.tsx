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

import { FileDown, MoreHorizontal } from "lucide-react";
import dayJS from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import {
  SortingColumnHeader,
  type OnSort,
  PositionFilteringColumnHeader,
  type OnFilter,
  PlaceFilteringColumnHeader,
  StatusFilteringColumnHeader,
  type OnCleanSort,
  type OnClearFilter,
} from "./cv-table-column";

dayJS.extend(utc);
dayJS.extend(relativeTime);
dayJS.locale("es");

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
  status: string;
  createdAt: string;
  attachments: RowAttachment[];
};

export type GenerateColumnsParams = {
  filteringState: ColumnFiltersState;
  onFilteringChange: OnFilter;
  onClearFilter: OnClearFilter;
  sortingState: SortingState;
  onSortingChange: OnSort;
  onCleanSort: OnCleanSort;
};

export function generateColumns({
  filteringState,
  onFilteringChange,
  onClearFilter,
  sortingState,
  onSortingChange,
  onCleanSort,
}: GenerateColumnsParams): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    {
      accessorKey: "name",
      header: () => {
        return (
          <SortingColumnHeader
            id="name"
            title="Nombre"
            isDesc={isDesc(sortingState, "name")}
            isSorting={isSorting(sortingState, "name")}
            onSortingChange={onSortingChange}
            onCleanSort={onCleanSort}
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
            isDesc={isDesc(sortingState, "email")}
            isSorting={isSorting(sortingState, "email")}
            onSortingChange={onSortingChange}
            onCleanSort={onCleanSort}
          />
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Enviado",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const local = dayJS.utc(createdAt).local();
        const date = dayJS().from(dayJS(local), true);
        return date;
      },
    },
    {
      accessorKey: "place",
      header: () => {
        return (
          <PlaceFilteringColumnHeader
            filteringState={filteringState}
            onFilter={onFilteringChange}
            onClearFilter={onClearFilter}
          />
        );
      },
    },
    {
      accessorKey: "position",
      header: () => {
        return (
          <PositionFilteringColumnHeader
            filteringState={filteringState}
            onFilter={onFilteringChange}
            onClearFilter={onClearFilter}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <StatusFilteringColumnHeader
            filteringState={filteringState}
            onFilter={onFilteringChange}
            onClearFilter={onClearFilter}
          />
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as CVRow["status"];
        let badgeColor = "";
        let badgeText = "";

        if (status === "pending") {
          badgeColor =
            "bg-yellow-300 text-yellow-900 hover:bg-yellow-300/80 hover:text-yellow-900";
          badgeText = "Pendiente";
        } else {
          badgeColor =
            "bg-green-300 text-green-900 hover:bg-green-300/80 hover:text-green-900";
          badgeText = "Revisado";
        }

        return <Badge className={badgeColor}>{badgeText}</Badge>;
      },
    },
    {
      accessorKey: "attachments",
      header: "Adjuntos",
      cell: ({ row }) => {
        const attachments = row.getValue("attachments") as RowAttachment[];
        const splitAttachmentText = (name: string) => {
          return name.split("/")[1];
        };
        return (
          <div className="flex justify-center gap-2">
            {attachments.map((attachment, index) => (
              <Button
                variant="outline"
                size="sm"
                className="font-normal"
                key={index}
                asChild
              >
                <a
                  href={attachment.url}
                  download={attachment.name}
                  className="flex items-center gap-1"
                >
                  {splitAttachmentText(attachment.type)}
                  <FileDown className="h-4 w-4" />
                </a>
              </Button>
            ))}
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
                <DropdownMenuItem>Marcar como revisado</DropdownMenuItem>
                <DropdownMenuItem>Marcar como rechazado</DropdownMenuItem>
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
                  <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
