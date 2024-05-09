import { CircleUser } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserDropdown from "./user-dropdown";

export default function CVDashboardHeader() {
  return (
    <header className="flex h-14 items-center justify-end border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <UserDropdown />
    </header>
  );
}
