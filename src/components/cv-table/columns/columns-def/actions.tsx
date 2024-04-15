import type { ColumnDef } from "@tanstack/react-table";
import type { Actions, CVRow } from "./types";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CVSStatus } from "@/constants";
import { MoreHorizontal } from "lucide-react";

export type ActionsColumnDefProps = {
  actions: Actions;
};

export function actionsColumnDef({
  actions,
}: ActionsColumnDefProps): ColumnDef<CVRow> {
  return {
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
                Esta acción no puede deshacerse. Esto eliminará permanentemente
                el CV y sus adjuntos.
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
  };
}
