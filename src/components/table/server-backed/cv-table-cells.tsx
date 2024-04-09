import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

export type CreatedAtCellProps = {
  createdAt: string;
};
export default function CreatedAtCell({ createdAt }: CreatedAtCellProps) {
  const formatted = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: es,
  });
  return (
    <div className="flex flex-col">
      <span>{formatted.replace("alrededor de ", "")}</span>
      <span className="text-xs text-slate-500">
        {`${format(createdAt, "dd/MM/yyyy", { locale: es })}`}
      </span>
    </div>
  );
}
