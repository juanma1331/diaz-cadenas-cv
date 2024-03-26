import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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

import { ArrowUpDown, FileDown, MoreHorizontal } from "lucide-react";

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
  attachments: RowAttachment[];
};

export type GenerateColumnsParams = {
  onSortingChange: (field: string, direction: "asc" | "desc") => void;
};

export function generateColumns(
  params: GenerateColumnsParams
): ColumnDef<CVRow>[] {
  const columns: ColumnDef<CVRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              params.onSortingChange(
                "name",
                column.getIsSorted() === "asc" ? "desc" : "asc"
              );

              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              params.onSortingChange(
                "email",
                column.getIsSorted() === "asc" ? "desc" : "asc"
              );

              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "place",
      header: "Lugar",
    },
    {
      accessorKey: "position",
      header: "Puesto",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as CVRow["status"];
        let badgeColor = "";
        let badgeText = "";

        if (status === "pending") {
          badgeColor =
            "bg-yellow-300 text-yellow-800 hover:bg-yellow-300/80 hover:text-yellow-800";
          badgeText = "Pendiente";
        } else if (status === "approved") {
          badgeColor =
            "bg-green-300 text-green-800 hover:bg-green-300/80 hover:text-green-800";
          badgeText = "Revisado";
        } else {
          badgeColor =
            "bg-red-300 text-red-800 hover:bg-red-300/80 hover:text-red-800";
          badgeText = "Rechazado";
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
