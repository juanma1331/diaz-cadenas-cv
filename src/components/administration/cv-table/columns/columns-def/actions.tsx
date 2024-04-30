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
import { CVS_STATUS } from "@/constants";
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
import type { RouterOuputs } from "@/server/utils";

export function actionsColumnDef(): ColumnDef<CVRow> {
  return {
    id: "actions",
    header: ({ table }) => {
      const { isActionColumnLoading, batchActions } = table.options.meta!;
      const rowSelectionState = table.getState().rowSelection;
      const rows = table.options.meta!.tableData;
      const someSelected = Object.keys(rowSelectionState).length > 0;
      const pageSelected = Object.values(rowSelectionState).some((v) => v);

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
                status: CVS_STATUS.REVIEWED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REJECTED,
                        }))
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.SELECTED,
                        }))
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.PENDING,
                        }))
                      )
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.REJECTED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REVIEWED,
                        }))
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.SELECTED,
                        }))
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.PENDING,
                        }))
                      )
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.PENDING,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REVIEWED,
                        }))
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.SELECTED,
                        }))
                      )
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REJECTED,
                        }))
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.SELECTED,
                selectedRows: selectedRows({ rowSelectionState, rows }),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REVIEWED,
                        }))
                      )
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.REJECTED,
                        }))
                      )
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      batchActions.onMarkAs(
                        selectedRows({ rowSelectionState, rows }).map((sr) => ({
                          id: sr.id,
                          name: sr.name,
                          newStatus: CVS_STATUS.PENDING,
                        }))
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
                      selectedRows({ rowSelectionState, rows }).map((r) => r.id)
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
    cell: ({ row, table }) => {
      const { actions } = table.options.meta!;
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
              {row.original.status !== CVS_STATUS.REVIEWED && (
                <DropdownMenuItem
                  onClick={() =>
                    actions.onMarkAs({
                      id: row.original.id,
                      name: row.original.name,
                      newStatus: CVS_STATUS.REVIEWED,
                    })
                  }
                >
                  <Check className="w-3.5 h-3.5 mr-2" />
                  Marcar como revisado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVS_STATUS.REJECTED && (
                <DropdownMenuItem
                  onClick={() =>
                    actions.onMarkAs({
                      id: row.original.id,
                      name: row.original.name,
                      newStatus: CVS_STATUS.REJECTED,
                    })
                  }
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Marcar como rechazado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVS_STATUS.SELECTED && (
                <DropdownMenuItem
                  onClick={() =>
                    actions.onMarkAs({
                      id: row.original.id,
                      name: row.original.name,
                      newStatus: CVS_STATUS.SELECTED,
                    })
                  }
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-2" />
                  Marcar como seleccionado
                </DropdownMenuItem>
              )}

              {row.original.status !== CVS_STATUS.PENDING && (
                <DropdownMenuItem
                  onClick={() =>
                    actions.onMarkAs({
                      id: row.original.id,
                      name: row.original.name,
                      newStatus: CVS_STATUS.PENDING,
                    })
                  }
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
                  onClick={() => actions.onDelete([row.original.id])}
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
  selectedRows: RouterOuputs["getAllCVS"]["cvs"];
};
function hasSameStatus({ status, selectedRows }: HasSameStatusParams): boolean {
  return selectedRows.every((r) => r.status === status);
}

type SelectedRowsParams = {
  rowSelectionState: RowSelectionState;
  rows: RouterOuputs["getAllCVS"]["cvs"];
};
function selectedRows({
  rowSelectionState,
  rows,
}: SelectedRowsParams): RouterOuputs["getAllCVS"]["cvs"] {
  const selectedIDs = Object.keys(rowSelectionState);

  const filteredRows = rows.filter((r) => selectedIDs.includes(r.id));

  return filteredRows.map((r) => r);
}
