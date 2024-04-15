import { HardDrive } from "lucide-react";

export type CVTableStorageUsedProps = {
  storageUsed: number; // in KB
};

export default function CVTableStorageUsed({
  storageUsed,
}: CVTableStorageUsedProps) {
  return (
    <div
      className={`flex items-center justify-center space-x-2 h-10 w-32 rounded-md`}
    >
      <HardDrive className="h-3.5 w-3.5 text-slate-800" />
      <span className="text-sm text-slate-600">En uso:</span>
      <span className={`font-semibold text-xs text-primary`}>
        {inGB(storageUsed)} GB
      </span>
    </div>
  );
}

function inGB(storageInKB: number) {
  return Math.round(storageInKB / 1024 / 1024);
}
