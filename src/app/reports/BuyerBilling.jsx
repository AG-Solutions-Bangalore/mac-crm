import { useApiMutation } from "@/hooks/useApiMutation";
import { useActiveBuyersQuery } from "@/modules/buyer/hooks/useBuyer";
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Cancelled sheets "billed" me nahi judte — sirf count/breakup me dikhte hai.
const isCancelled = (s) => {
  const v = (s || "").toLowerCase();
  return v === "cancel" || v === "cancelled";
};

const inr = (n) => `₹${Number(n || 0).toLocaleString()}`;

function BuyerBilling() {
  const { trigger, loading, error } = useApiMutation();
  const [reportData, setReportData] = useState([]);

  const [fromDate, setFromDate] = useState(new Date("2020-01-01"));
  const [toDate, setToDate] = useState(moment().toDate());
  const [buyerId, setBuyerId] = useState("all");
  const [detailBuyer, setDetailBuyer] = useState(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: buyersData } = useActiveBuyersQuery();
  const activeBuyers = buyersData?.data || [];
  const buyerMobileMap = useMemo(() => {
    const m = {};
    activeBuyers.forEach((b) => {
      m[b.id?.toString()] = b.buyer_mobile || "-";
    });
    return m;
  }, [activeBuyers]);

  const fetchReport = async () => {
    try {
      const payload = {
        from_date: moment(fromDate).format("YYYY-MM-DD"),
        to_date: moment(toDate).format("YYYY-MM-DD"),
      };
      if (buyerId && buyerId !== "all") payload.buyer_id = buyerId;
      const response = await trigger({
        url: "/buyer-quotation-summary-report",
        method: "post",
        data: payload,
      });
      setReportData(response?.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch buyer billing report:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // 1 customer ki saari sheets (automation alag, lights alag) ka combined total.
  const buyerRows = useMemo(() => {
    const map = {};
    (reportData || []).forEach((q) => {
      const key = q?.quotation_buyer_id?.toString();
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          buyer_id: key,
          buyer_name: q?.buyer_name || `Buyer #${key}`,
          count: 0,
          total: 0,
          pending: 0,
          approved: 0,
          project: 0,
          rows: [],
        };
      }
      const amt = Number(q?.quotation_amount) || 0;
      const st = q?.quotation_status || "";
      map[key].count += 1;
      map[key].rows.push(q);
      if (!isCancelled(st)) map[key].total += amt;
      const sl = st.toLowerCase();
      if (sl === "pending") map[key].pending += amt;
      else if (sl === "approved") map[key].approved += amt;
      else if (sl === "project") map[key].project += amt;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [reportData]);

  const grandTotal = useMemo(
    () => buyerRows.reduce((s, r) => s + r.total, 0),
    [buyerRows]
  );
  const grandSheets = useMemo(
    () => buyerRows.reduce((s, r) => s + r.count, 0),
    [buyerRows]
  );

  // pagination logic
  const totalPages = Math.ceil(buyerRows.length / itemsPerPage);

  const paginatedData = buyerRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportExcel = () => {
    if (buyerRows.length === 0) return;

    const exportData = buyerRows.map((item) => ({
      Buyer: item.buyer_name || "-",
      Mobile: buyerMobileMap[item.buyer_id] || "-",
      Sheets: item.count,
      "Pending (₹)": Math.round(item.pending),
      "Approved (₹)": Math.round(item.approved),
      "Project (₹)": Math.round(item.project),
      "Total Billed (₹)": Math.round(item.total),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buyer Billing");

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, "Buyer_Billing_Report.xlsx");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Buyer Billing Report
        </h2>

        <Button
          onClick={handleExportExcel}
          disabled={loading || buyerRows.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Billing</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full md:w-auto">
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium leading-none">
                  From Date
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[200px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moment(fromDate).format("ll")}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(date) => date > toDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium leading-none">
                  To Date
                </label>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[200px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moment(toDate).format("ll")}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => date < fromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium leading-none">
                  Buyer
                </label>

                <Select
                  value={buyerId}
                  onValueChange={(value) => {
                    setBuyerId(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Select Buyer" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Buyers</SelectItem>
                    {activeBuyers.map((b) => (
                      <SelectItem key={b.id} value={b.id?.toString()}>
                        {b.buyer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={fetchReport} disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <span>Billing Data</span>
            {!loading && buyerRows.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {buyerRows.length} buyers • {grandSheets} sheets • Total{" "}
                <span className="font-bold text-foreground">{inr(grandTotal)}</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-red-500 py-4 text-center">
              Failed to load billing report data.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead className="text-right">Sheets</TableHead>
                      <TableHead className="text-right">Pending (₹)</TableHead>
                      <TableHead className="text-right">Approved (₹)</TableHead>
                      <TableHead className="text-right">Project (₹)</TableHead>
                      <TableHead className="text-right">Total Billed (₹)</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedData.length ? (
                      paginatedData.map((row, index) => (
                        <TableRow
                          key={row.buyer_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setDetailBuyer(row)}
                          title="Click to view all sheets"
                        >
                          <TableCell>
                            <motion.div
                              initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              transition={{ duration: 0.22, delay: index * 0.008 }}
                              className="font-medium text-blue-600 dark:text-blue-400"
                            >
                              {row.buyer_name}
                            </motion.div>
                          </TableCell>
                          <TableCell>{buyerMobileMap[row.buyer_id] || "-"}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{inr(row.pending)}</TableCell>
                          <TableCell className="text-right">{inr(row.approved)}</TableCell>
                          <TableCell className="text-right">{inr(row.project)}</TableCell>
                          <TableCell className="text-right font-bold">
                            {inr(row.total)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No billing records found for this filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Buyer sheets detail — saari sheets combined */}
      <Dialog
        open={Boolean(detailBuyer)}
        onOpenChange={(open) => {
          if (!open) setDetailBuyer(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{detailBuyer?.buyer_name} — Sheets Detail</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {moment(fromDate).format("YYYY-MM-DD")} to{" "}
              {moment(toDate).format("YYYY-MM-DD")} • Cancel sheets total me
              nahi judti
            </p>
          </DialogHeader>
          {!detailBuyer ? null : (
            <div className="space-y-4 min-w-0">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border p-2">
                  <div className="text-[11px] text-muted-foreground">Sheets</div>
                  <div className="font-bold">{detailBuyer.count}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[11px] text-muted-foreground">Pending ₹</div>
                  <div className="font-bold">{inr(detailBuyer.pending)}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[11px] text-muted-foreground">Approved ₹</div>
                  <div className="font-bold">{inr(detailBuyer.approved)}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[11px] text-muted-foreground">Project ₹</div>
                  <div className="font-bold">{inr(detailBuyer.project)}</div>
                </div>
              </div>
              <div className="rounded-lg border px-3 py-2 flex justify-between items-center bg-muted/40">
                <span className="text-sm font-medium">Total Billed</span>
                <span className="text-lg font-bold">{inr(detailBuyer.total)}</span>
              </div>
              <div className="space-y-2">
                {detailBuyer.rows.map((q) => (
                  <div
                    key={q.id}
                    className="flex justify-between items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {q.quotation_ref || `Q#${q.quotation_no}`}{" "}
                        <span className="text-xs text-muted-foreground">
                          • {q.quotation_date || "-"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {q.quotation_service_name || "-"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold whitespace-nowrap">
                        {inr(q.quotation_amount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {q.quotation_status || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BuyerBilling;
