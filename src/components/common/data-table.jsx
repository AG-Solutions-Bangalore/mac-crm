import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  SquarePlus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const DataTable = ({
  data = [],
  columns = [],
  pageSize = 10,
  searchPlaceholder = "Search...",
  addButton,
  extraButton,

  // backend pagination props
  backendPagination = false,
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,

  // backend search props
  searchValue,
  onSearchChange,
  isLoading = false,
}) => {
  const [internalSearch, setInternalSearch] = useState(searchValue ?? "");
  const prevSearchValueRef = useRef(searchValue);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState(onSearchChange ? "" : (searchValue ?? ""));
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  // Keep internalSearch in sync when parent explicitly changes searchValue
  useEffect(() => {
    if (searchValue !== prevSearchValueRef.current) {
      prevSearchValueRef.current = searchValue;
      setInternalSearch(searchValue ?? "");
      if (!onSearchChange) {
        setGlobalFilter(searchValue ?? "");
      }
    }
  }, [searchValue, onSearchChange]);

  // Debounced search trigger for backend search
  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      if (internalSearch !== (searchValue ?? "")) {
        onSearchChange(internalSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange, searchValue]);

  const handleSearchChange = (value) => {
    setInternalSearch(value);
    if (!onSearchChange) {
      setGlobalFilter(value);
    }
  };

  const handleClearSearch = () => {
    setInternalSearch("");
    if (onSearchChange) {
      onSearchChange("");
    } else {
      setGlobalFilter("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClearSearch();
    } else if (e.key === "Enter" && onSearchChange) {
      onSearchChange(internalSearch);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: onSearchChange ? "" : globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    // Ensure all leaf columns can be globally filtered even if row 0 has null / undefined values
    getColumnCanGlobalFilter: () => true,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const search = String(filterValue).toLowerCase().trim();
      const value = row.getValue(columnId);
      if (value != null && String(value).toLowerCase().includes(search)) {
        return true;
      }
      if (row.original && typeof row.original === "object") {
        for (const key in row.original) {
          const val = row.original[key];
          if (val != null && (typeof val === "string" || typeof val === "number")) {
            if (String(val).toLowerCase().includes(search)) {
              return true;
            }
          }
        }
      }
      return false;
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // use frontend pagination only if backendPagination = false
    ...(backendPagination
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
  });

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between py-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
          <Input
            value={internalSearch ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="pl-8 pr-8 h-9 text-sm"
          />
          {internalSearch ? (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
          {/* COLUMN TOGGLE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Columns <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnDef = columns.find(
                    (col) =>
                      col.accessorKey === column.id || col.id === column.id,
                  );

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="text-xs capitalize"
                    >
                      {columnDef?.header || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {extraButton}
          {/* ADD BUTTON */}
          {addButton &&
            (addButton.to ? (
              <Link to={addButton.to}>
                <Button size="sm" className="h-9">
                  <SquarePlus className="h-3 w-3 mr-2" />
                  {addButton.label}
                </Button>
              </Link>
            ) : (
              <Button size="sm" className="h-9" onClick={addButton.onClick}>
                <SquarePlus className="h-3 w-3 mr-2" />
                {addButton.label}
              </Button>
            ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-lg bg-card shadow-sm border border-border min-h-[31rem] grid grid-cols-1 p-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={canSort ? "cursor-pointer select-none" : ""}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {canSort && (
                          <>
                            {sortState === "asc" && (
                              <ChevronUp className="h-3 w-3" />
                            )}
                            {sortState === "desc" && (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            {!sortState && (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`} className="border-b">
                  {columns.map((col, cIdx) => (
                    <TableCell key={`skeleton-col-${cIdx}`} className="py-3.5 px-4">
                      <Skeleton
                        className={`h-4 ${
                          cIdx === 0
                            ? "w-8"
                            : cIdx === 1
                            ? "w-32"
                            : cIdx === columns.length - 1
                            ? "w-16"
                            : "w-24"
                        }`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.22, delay: index * 0.008 }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </motion.div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Total Records:{" "}
          {backendPagination
            ? totalRecords
            : table.getFilteredRowModel().rows.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              backendPagination ? onPageChange(page - 1) : table.previousPage()
            }
            disabled={
              isLoading || (backendPagination ? page === 1 : !table.getCanPreviousPage())
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page{" "}
            {backendPagination
              ? page
              : table.getState().pagination.pageIndex + 1}{" "}
            of {backendPagination ? totalPages : table.getPageCount()}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              backendPagination ? onPageChange(page + 1) : table.nextPage()
            }
            disabled={
              isLoading || (backendPagination ? page === totalPages : !table.getCanNextPage())
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
