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

export type CVIndexPageHeaderProps = {
  onSearch: OnSearch;
};

export default function CVIndexPageHeader({
  onSearch,
}: CVIndexPageHeaderProps) {
  const ref = useRef<HTMLFormElement | null>(null);

  function handleSendForm() {
    if (ref.current) ref.current.submit();
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <CVTableSearch onSearchChange={onSearch} />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSendForm}>
            Salir
            <form ref={ref} action="/api/auth/logout" method="post"></form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
