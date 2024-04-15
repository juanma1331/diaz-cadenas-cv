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
import { Ellipsis, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ActionsColumnDefProps = {
  actions: Actions;
};

export function actionsColumnDef({
  actions,
}: ActionsColumnDefProps): ColumnDef<CVRow> {
  return {
    id: "actions",
    header: ({ table }) => {
      const rowSelection = table.getState().rowSelection;
      const someSelected = table.getIsSomeRowsSelected();
      const pageSelected = table.getIsAllPageRowsSelected();

      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="relative"
                disabled={!someSelected && !pageSelected}
              >
                <span className="sr-only">Open menu</span>
                <Ellipsis className="w-3.5 h-3.5" />
                {(someSelected || pageSelected) && (
                  <div className="w-4 h-4 flex items-center justify-center rounded-full bg-red-600 absolute top-0 right-0">
                    <span className="text-xs font-thin text-white">
                      {Object.values(rowSelection).length}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones en bloque</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => console.log("mark as reviewed")}>
                Marcar como revisado
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => console.log("mark as reviewed")}>
                Marcar como rechazado
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => console.log("mark as reviewed")}>
                Marcar como seleccionado
              </DropdownMenuItem>
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
                  onClick={() => console.log("delete all selected")}
                >
                  Eliminar
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
    cell: ({ row }) => {
      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3.5 w-3.5" />
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
