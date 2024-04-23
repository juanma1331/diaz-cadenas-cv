import type { ColumnDef } from "@tanstack/react-table";
import type { CVRow, RowAttachment } from "./types";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function attachmentsColumnDef(): ColumnDef<CVRow> {
  return {
    accessorKey: "attachments",
    header: () => <span className="text-slate-800">Adjuntos</span>,
    cell: ({ row }) => {
      const attachments = row.getValue("attachments") as RowAttachment[];
      return (
        <div className="flex items-center gap-2" key={"random key"}>
          {attachments.map((att, i) => {
            const isPdf = att.type.includes("application/pdf");
            const isVideo = att.type.includes("video/");
            if (!isPdf && !isVideo) throw new Error("Invalid attachment type");

            if (isPdf) {
              return (
                <Button
                  variant="outline"
                  size="icon"
                  className="font-normal"
                  key={`attachment-header-${att.type}`}
                  asChild
                >
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
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
                      size="icon"
                      className="font-normal"
                    >
                      <Video className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <video
                      className="rounded-md"
                      width={1280}
                      height={720}
                      controls
                    >
                      <source src={att.url} type={att.type} />
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
  };
}
