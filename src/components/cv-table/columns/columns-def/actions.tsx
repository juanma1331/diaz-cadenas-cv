import type { ColumnDef, Row, RowSelectionState } from "@tanstack/react-table";
import type { Actions, BatchActions, CVRow } from "./types";
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
import {
  Check,
  CheckCheck,
  Clock,
  Ellipsis,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

export type ActionsColumnDefProps = {
  actions: Actions;
  batchActions: BatchActions;
  isActionColumnLoading: boolean;
};

export function actionsColumnDef({
  actions,
  batchActions,
  isActionColumnLoading,
}: ActionsColumnDefProps): ColumnDef<CVRow> {
  return {
    id: "actions",
    header: ({ table }) => {
      const rowSelectionState = table.getState().rowSelection;
      const rows = table.getCoreRowModel().rows;
      const someSelected = table.getIsSomeRowsSelected();
      const pageSelected = table.getIsAllPageRowsSelected();

      if (isActionColumnLoading) {
        return (
          <RefreshCcw className="ml-3 h-3.5 w-3.5 text-slate-800 animate-spin" />
        );
      }

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
                      {Object.values(rowSelectionState).length}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones en bloque</DropdownMenuLabel>

              {hasSameStatus({
                status: CVSStatus.REVIEWED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsRejected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsSelected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsPending(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVSStatus.REJECTED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsReviewed(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsSelected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsPending(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVSStatus.PENDING,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsReviewed(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsSelected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsRejected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVSStatus.SELECTED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsReviewed(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsRejected(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAsPending(
                        selectedRows({ rowSelectionState, rows })
                      )
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-500">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
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
                  onClick={() =>
                    batchActions.onDelete(
                      selectedRows({ rowSelectionState, rows })
                    )
                  }
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
                  <Check className="w-3.5 h-3.5 mr-2" />
                  Marcar como revisado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVSStatus.REJECTED && (
                <DropdownMenuItem
                  onClick={() => actions.onMarkAsRejected(row.original)}
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Marcar como rechazado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVSStatus.SELECTED && (
                <DropdownMenuItem
                  onClick={() => actions.onMarkAsSelected(row.original)}
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-2" />
                  Marcar como seleccionado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVSStatus.PENDING && (
                <DropdownMenuItem
                  onClick={() => actions.onMarkAsPending(row.original)}
                >
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Marcar como pendiente
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />

              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-red-500">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
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

type HasSameStatusParams = {
  status: number;
  selectedRows: CVRow[];
};
function hasSameStatus({ status, selectedRows }: HasSameStatusParams): boolean {
  return selectedRows.every((r) => r.status === status);
}

type SelectedRowsParams = {
  rowSelectionState: RowSelectionState;
  rows: Row<CVRow>[];
};
function selectedRows({
  rowSelectionState,
  rows,
}: SelectedRowsParams): CVRow[] {
  const selectedIDs = Object.keys(rowSelectionState);

  const filteredRows = rows.filter((r) => selectedIDs.includes(r.original.id));

  return filteredRows.map((r) => r.original);
}
