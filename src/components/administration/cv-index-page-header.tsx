import { CircleUser } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import CVTableSearch, { type OnSearch } from "./cv-table/search";
import { useRef } from "react";
import UserDropdown from "./user-dropdown";

export type CVIndexPageHeaderProps = {
  onSearch: OnSearch;
};

export default function CVIndexPageHeader({
  onSearch,
}: CVIndexPageHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <CVTableSearch onSearchChange={onSearch} />
      </div>
      <UserDropdown />
    </header>
  );
}
