import { Checkbox } from "@/components/ui/checkbox";
import type { FilterToggler } from "./types";
import { Label } from "@/components/ui/label";

export interface TogglerProps extends FilterToggler {
  onCheckedChange: (name: string, checked: boolean) => void;
}
export default function Toggler({
  name,
  checked,
  onCheckedChange,
}: TogglerProps) {
  return (
    <div className="py-1 flex items-center gap-2">
      <Checkbox
        onCheckedChange={(e) => onCheckedChange(name, !checked)}
        checked={checked}
        id={`position-filter-${name}`}
      />
      <Label
        className="text-sm font-normal"
        htmlFor={`position-filter-${name}`}
      >
        {name}
      </Label>
    </div>
  );
}

export function activeTogglersName(togglers: Array<FilterToggler>) {
  const actives = togglers.filter((f) => f.checked === true);

  return actives.reduce((p, c, i) => {
    if (actives.length < 2) return c.name;

    return i !== actives.length - 1
      ? p.concat(`${c.name}, `)
      : p.concat(c.name);
  }, "");
}
