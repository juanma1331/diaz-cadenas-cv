import type { ColumnDef, Row, RowSelectionState } from "@tanstack/react-table";
import type { CVRow, OnDelete, OnMark } from "../../types";
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
import { useEffect, useState } from "react";

export default function actionsColumnDef(): ColumnDef<CVRow> {
  return {
    id: "actions",
    header: ({ table }) => {
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
      const { handlers, loading } = table.options.meta!;
      const rowSelectionState = table.getState().rowSelection;
      const tableData = table.options.meta!.tableData;
      const someSelected = Object.keys(rowSelectionState).length > 0;
      const pageSelected =
        tableData.length > 0 &&
        Object.entries(rowSelectionState).length === tableData.length;

      const handleOnMark: OnMark = (params) => {
        setIsLoading(true);
        handlers.onMarkAs(params);
      };

      useEffect(() => {
        if (!loading.isChangeStatusLoading && !loading.isTableDataLoading) {
          setIsLoading(false);
        }
      }, [loading.isChangeStatusLoading, loading.isTableDataLoading]);

      useEffect(() => {
        if (!loading.isDeleteLoading && !loading.isTableDataLoading) {
          setDeleteDialogOpen(false);
        }
      }, [loading.isDeleteLoading]);

      if (isLoading) {
        return <RowSpinner />;
      }

      return (
        <AlertDialog open={deleteDialogOpen}>
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
                rowsStatus: selectedRows({
                  rowSelectionState,
                  tableData,
                }).map((r) => r.status),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REJECTED,
                      })
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.SELECTED,
                      })
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.PENDING,
                      })
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.REJECTED,
                rowsStatus: selectedRows({
                  rowSelectionState,
                  tableData,
                }).map((r) => r.status),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REVIEWED,
                      })
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.SELECTED,
                      })
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.PENDING,
                      })
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.PENDING,
                rowsStatus: selectedRows({
                  rowSelectionState,
                  tableData,
                }).map((r) => r.status),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REVIEWED,
                      })
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.SELECTED,
                      })
                    }
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-2" />
                    Marcar como seleccionado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REJECTED,
                      })
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>
                </>
              )}

              {hasSameStatus({
                status: CVS_STATUS.SELECTED,
                rowsStatus: selectedRows({
                  rowSelectionState,
                  tableData,
                }).map((r) => r.status),
              }) && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REVIEWED,
                      })
                    }
                  >
                    <Check className="w-3.5 h-3.5 mr-2" />
                    Marcar como revisado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.REJECTED,
                      })
                    }
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Marcar como rechazado
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      handleOnMark({
                        ids: selectedRows({
                          rowSelectionState,
                          tableData,
                        }).map((r) => r.id),
                        newStatus: CVS_STATUS.PENDING,
                      })
                    }
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Marcar como pendiente
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => setDeleteDialogOpen(true)}
                >
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
              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                {/* TODO: Fix this */}
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    handlers.onDelete(
                      selectedRows({ rowSelectionState, tableData }).map(
                        (r) => r.id
                      )
                    )
                  }
                >
                  {(loading.isDeleteLoading || loading.isTableDataLoading) && (
                    <RowSpinner />
                  )}
                  Eliminar
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
    cell: ({ row, table }) => {
      const [isLoading, setIsLoading] = useState<boolean>(false);
      const [dialogOpen, setDialogOpen] = useState<boolean>(false);
      const { handlers, loading } = table.options.meta!;

      useEffect(() => {
        if (!loading.isChangeStatusLoading && !loading.isTableDataLoading) {
          setIsLoading(false);
        }
      }, [loading.isChangeStatusLoading, loading.isTableDataLoading]);

      useEffect(() => {
        if (dialogOpen) setDialogOpen(false);
      }, [loading.isDeleteLoading]);

      const handleOnMark: OnMark = (params) => {
        setIsLoading(true);
        handlers.onMarkAs(params);
      };

      if (isLoading) {
        return <RowSpinner />;
      }

      return (
        <AlertDialog open={dialogOpen}>
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
                    handleOnMark({
                      ids: [row.original.id],
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
                    handleOnMark({
                      ids: [row.original.id],
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
                    handleOnMark({
                      ids: [row.original.id],
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
                    handleOnMark({
                      ids: [row.original.id],
                      newStatus: CVS_STATUS.PENDING,
                    })
                  }
                >
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Marcar como pendiente
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />

              <AlertDialogTrigger asChild onClick={() => setDialogOpen(true)}>
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
              <AlertDialogCancel onClick={() => setDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                {/* TODO: Fix this */}
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handlers.onDelete([row.original.id])}
                >
                  {loading.isDeleteLoading && <RowSpinner />}
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

function RowSpinner() {
  return (
    <RefreshCcw className="ml-2 h-3.5 w-3.5 text-foreground animate-spin" />
  );
}

type HasSameStatusParams = {
  status: number;
  rowsStatus: Array<number>;
};
function hasSameStatus({ status, rowsStatus }: HasSameStatusParams): boolean {
  return rowsStatus.every((s) => s === status);
}

type SelectedRowsParams = {
  rowSelectionState: RowSelectionState;
  tableData: RouterOuputs["getAllCVS"]["cvs"];
};
function selectedRows({
  rowSelectionState,
  tableData,
}: SelectedRowsParams): RouterOuputs["getAllCVS"]["cvs"] {
  const selectedIDs = Object.keys(rowSelectionState);

  const filteredRows = tableData.filter((r) => selectedIDs.includes(r.id));

  return filteredRows.map((r) => r);
}
