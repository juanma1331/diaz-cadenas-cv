import { type Table as TableType } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Button } from "../../ui/button";

type CVTablePaginationProps = {
  pages: Array<number>;
  limit: number;
  onLimitChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onFirstPage: () => void;
};

export default function CVTablePagination({
  pages,
  limit,
  onLimitChange,
  onPrevPage,
  onNextPage,
  onLastPage,
  onFirstPage,
}: CVTablePaginationProps) {
  return (
    <div className="flex items-center justify-end px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              onLimitChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              onFirstPage();
            }}
          >
            <span className="sr-only">Ir a la primera página</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPrevPage()}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página 1 de {pages.length}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onNextPage()}
          >
            <span className="sr-only">Ir a la siguiente página</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              onLastPage();
            }}
          >
            <span className="sr-only">Ir a la última página</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
