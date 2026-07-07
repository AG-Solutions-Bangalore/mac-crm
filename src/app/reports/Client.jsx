import { CLIENT_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const getServiceBadgeClass = (serviceName) => {
  if (!serviceName) return "badge-default";
  const service = serviceName.toLowerCase();
  if (service.includes("switch")) return "badge-switches";
  if (service.includes("door") || service.includes("automation")) return "badge-automation";
  if (service.includes("network") || service.includes("wifi") || service.includes("internet")) return "badge-networking";
  if (service.includes("light")) return "badge-lighting";
  if (service.includes("secur") || service.includes("camera") || service.includes("cctv")) return "badge-security";
  return "badge-default";
};

function Client() {
  const {
    data: Data,
    isLoading,
    isError,
  } = useGetApiMutation({
    url: CLIENT_API.report,
    queryKey: ["client-report"],
  });

  const reportData = Data?.data || [];

  const [sorting, setSorting] = useState([]);

  const columns = [
    {
      header: "M ID",
      accessorKey: "m_id",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
      enableSorting: false,
    },
    {
      header: "Area",
      accessorKey: "area",
      enableSorting: false,
    },
    {
      header: "Service",
      accessorKey: "services_name",
      enableSorting: false,
      cell: ({ row }) => {
        const services = row.original.services_name;
        if (!services) return <span>-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {services.split(",").map((s) => {
              const name = s.trim();
              return (
                <span key={name} className={`service-badge ${getServiceBadgeClass(name)}`}>
                  {name}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      cell: ({ row }) => (
        <span className={`pill ${row.original.status === "Active" ? "pill-approved" : "pill-rejected"}`}>
          {row.original.status || "-"}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: reportData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    const exportData = reportData.map((item) => ({
      M_ID: item.m_id || "-",
      Name: item.name || "-",
      Mobile: item.mobile || "-",
      Area: item.area || "-",
      Service: item.services_name || "-",
      Status: item.status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients Report");

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
    ];

    XLSX.writeFile(workbook, "Client_Report.xlsx");
  };

  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client Report</h2>

        <Button
          onClick={handleExportExcel}
          disabled={isLoading || reportData.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Data</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 py-4 text-center">
              Failed to load client report data.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
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
                              className={
                                canSort ? "cursor-pointer select-none" : ""
                              }
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
                    {table.getRowModel().rows.length ? (
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
                        <TableCell colSpan={6} className="text-center">
                          No client records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Client;
