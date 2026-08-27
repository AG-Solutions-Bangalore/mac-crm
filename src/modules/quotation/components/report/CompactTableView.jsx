import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import logoImg from "@/assets/logo.png";

export default function CompactTableView({
  headers,
  tableRows,
  items,
  grandTotal,
  gstTax,
  netTotal,
  formatMoney,
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4 quotation-no-print">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Project Estimate</CardDescription>
            <CardTitle className="text-2xl font-bold text-sky-400">{formatMoney(grandTotal)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Products / Items</CardDescription>
            <CardTitle className="text-2xl font-bold text-white">{items.length} Items</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Estimated Tax (GST 18%)</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-400">{formatMoney(gstTax)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Net Estimated Payable</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400">{formatMoney(netTotal)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 p-2 rounded-xl border border-white/40 shadow-sm">
                <img src={logoImg} alt="MAKc Logo" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Experience The Smart Living</CardTitle>
                <CardDescription className="text-slate-400">Home automation project quotation breakdown</CardDescription>
              </div>
            </div>
            <div className="text-left text-sm md:text-right">
              <div className="font-semibold text-slate-300">Total Project</div>
              <div className="text-xl font-bold text-sky-400">{formatMoney(grandTotal)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-slate-950">
                <TableRow className="border-slate-800">
                  {headers.map((header) => (
                    <TableHead key={header} className="text-slate-400 text-xs font-semibold">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) =>
                  row.type === "item" ? (
                    <TableRow key={`${row.product}-${index}`} className="border-slate-800/60 hover:bg-slate-850">
                      <TableCell className="font-medium text-slate-200">{row.application || "-"}</TableCell>
                      <TableCell className="text-slate-300">{row.floor || "-"}</TableCell>
                      <TableCell className="text-slate-300">{row.area || "-"}</TableCell>
                      <TableCell className="font-semibold text-white">{row.product}</TableCell>
                      <TableCell className="text-slate-300 text-center">{row.quantity || "-"}</TableCell>
                      <TableCell className="text-slate-300">{formatMoney(row.price)}</TableCell>
                      <TableCell className="font-bold text-sky-400">{formatMoney(row.totalPrice)}</TableCell>
                      <TableCell className="text-slate-300">{row.brand || "-"}</TableCell>
                      <TableCell className="text-slate-300">{row.warranty || "-"}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={`${row.label}-${index}`} className="bg-slate-950 font-bold border-slate-800">
                      <TableCell colSpan={6} className="text-sky-300 uppercase text-xs tracking-wider">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-sky-400">{formatMoney(row.totalPrice)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
