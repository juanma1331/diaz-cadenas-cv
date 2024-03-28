import { HardDrive } from "lucide-react";

export type CVTableStorageUsedProps = {
  storageUsed: number;
};

// Función para determinar el color basado en el almacenamiento utilizado
const getColorBasedOnStorageUsed = (storageUsed: number): string => {
  if (storageUsed < 25) {
    return "text-green-500";
  } else if (storageUsed < 50) {
    return "text-blue-500";
  } else if (storageUsed < 75) {
    return "text-orange-500";
  } else {
    return "text-red-500";
  }
};

export default function CVTableStorageUsed({
  storageUsed,
}: CVTableStorageUsedProps) {
  const colorClass = getColorBasedOnStorageUsed(storageUsed);

  return (
    <div className="flex items-center space-x-2">
      <HardDrive className="h-3.5 w-3.5 text-slate-800" />
      <span className="font-semibold text-sm text-slate-600">En uso:</span>
      <span className={`font-bold text-xs ${colorClass}`}>
        {storageUsed} GB
      </span>
    </div>
  );
}
