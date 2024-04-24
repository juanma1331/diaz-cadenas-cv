import { CVS_STATUS } from "@/constants";

export function statusMap(status: number): string {
  switch (status) {
    case CVS_STATUS.PENDING:
      return "Pendiente";
    case CVS_STATUS.REJECTED:
      return "Reachazado";
    case CVS_STATUS.REVIEWED:
      return "Revisado";
    case CVS_STATUS.SELECTED:
      return "Seleccionado";
    default:
      throw new Error("Invalid status");
  }
}
