import { HardDrive } from "lucide-react";

export type CVTableStorageUsedProps = {
  storageUsed: number;
};

// Función para determinar el color basado en el almacenamiento utilizado
const getColorBasedOnStorageUsed = (storageUsed: number): string => {
  if (storageUsed < 25) {
    return "border-green-400";
  } else if (storageUsed < 50) {
    return "border-blue-400";
  } else if (storageUsed < 75) {
    return "border-orange-400";
  } else {
    return "border-red-400";
  }
};

export default function CVTableStorageUsed({
  storageUsed,
}: CVTableStorageUsedProps) {
  const borderColor = getColorBasedOnStorageUsed(storageUsed);

  return (
    <div
      className={`flex items-center justify-center space-x-2 border ${borderColor} h-10 w-32 rounded-md`}
    >
      <HardDrive className="h-3.5 w-3.5 text-slate-800" />
      <span className="text-sm text-slate-600">En uso:</span>
      <span className={`font-semibold text-xs text-primary`}>
        {storageUsed} GB
      </span>
    </div>
  );
}
