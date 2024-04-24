import { RefreshCcw } from "lucide-react";

export default function Spinner() {
  return (
    <div className="flex items-center flex-col gap-2">
      <RefreshCcw className="h-4 w-4 animate-spin mx-auto text-foreground" />
      <p className="text-foreground text-sm">Cargando...</p>
    </div>
  );
}
