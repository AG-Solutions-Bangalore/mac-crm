import { CLIENT_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import React from "react";
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
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    // Define the columns we want to export based on the data structure
    const exportData = reportData.map((item) => ({
      M_ID: item.m_id || "-",
      Name: item.name || "-",
      Mobile: item.mobile || "-",
      Area: item.area || "-",
      Service: item.services_name || "-",
      Status: item.status || "-",
    }));

    // Create a new workbook and add the worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients Report");

    // Default column widths
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
    ];

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "Client_Report.xlsx");
  };

  return (
    // <Page>
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
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 py-4 text-center">
              Failed to load client report data.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>M ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.length > 0 ? (
                    reportData.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.m_id || "-"}
                        </TableCell>
                        <TableCell>{report.name || "-"}</TableCell>
                        <TableCell>{report.mobile || "-"}</TableCell>
                        <TableCell>{report.area || "-"}</TableCell>
                        <TableCell>{report.services_name || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              report.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {report.status || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No client records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    // </Page>
  );
}

export default Client;
