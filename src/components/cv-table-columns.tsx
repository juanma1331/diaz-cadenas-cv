import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type Attachment = {
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
  status: "pending" | "reviewed" | "rejected";
  attachments: Attachment[];
};

export const columns: ColumnDef<CVRow>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "place",
    header: "Lugar",
  },
  {
    accessorKey: "position",
    header: "Posición",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as CVRow["status"];
      let badgeColor = "";
      let badgeText = "";

      if (status === "pending") {
        badgeColor = "bg-yellow-300 text-yellow-800";
        badgeText = "Pendiente";
      } else if (status === "reviewed") {
        badgeColor = "bg-green-300 text-green-800";
        badgeText = "Revisado";
      } else {
        badgeColor = "bg-red-300 text-red-800";
        badgeText = "Rechazado";
      }

      return <Badge className={badgeColor}>{badgeText}</Badge>;
    },
  },
  {
    accessorKey: "attachments",
    header: "Adjuntos",
    cell: ({ row }) => {
      const attachments = row.getValue("attachments") as Attachment[];
      return (
        <div className="flex gap-2">
          {attachments.map((attachment, index) => (
            <Button variant="outline" size="sm" key={index} asChild>
              <a href={attachment.url} download={attachment.name}>
                {attachment.type}
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Revisar
          </Button>
          <Button variant="outline" size="sm">
            Rechazar
          </Button>
          <Button variant="outline" size="sm">
            Borrar
          </Button>
        </div>
      );
    },
  },
];
