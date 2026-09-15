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

const formatWarranty = (val) => {
  if (!val || val === "-" || val === "null" || val === "undefined") return "-";
  const str = String(val).trim();
  const num = parseFloat(str);
  if (!isNaN(num) && /^\d+(\.\d+)?$/.test(str)) {
    const intOrFloat = num % 1 === 0 ? num.toFixed(0) : num;
    return `${intOrFloat} ${intOrFloat === 1 ? "Yr" : "Yrs"}`;
  }
  return str;
};

// Light-only PDF export theme — ignores the app's global dark/light mode
// via explicit inline styles + colorScheme so print output is always light.
const LIGHT = {
  pageBg: "#ffffff",
  pageText: "#0f172a",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  mutedText: "#64748b",
  headingText: "#0f172a",
  bodyText: "#475569",
  headerBg: "#f8fafc",
  headerBorder: "#e2e8f0",
  rowBorder: "#f1f5f9",
  rowHover: "#f8fafc",
  summaryBg: "#f8fafc",
  accent: "#0284c7",
  accentStrong: "#0369a1",
  gold: "#b45309",
  green: "#059669",
};

export default function CompactTableView({
  headers,
  tableRows,
  items,
  grandTotal,
  installationFee,
  installPct = 5,
  netTotal,
  formatMoney,
}) {
  return (
    <div
      className="makc-page makc-page-dynamic makc-compact-view space-y-6 w-full py-4 px-4 md:px-6"
      style={{
        background: LIGHT.pageBg,
        color: LIGHT.pageText,
        colorScheme: "light",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Metric Cards (screen only — hidden in print) */}
      <div className="grid gap-4 md:grid-cols-4 quotation-no-print">
        <Card
          className="border shadow-sm"
          style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder, color: LIGHT.pageText }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: LIGHT.mutedText }}>Hardware Subtotal</CardDescription>
            <CardTitle className="text-2xl font-bold" style={{ color: LIGHT.accent }}>{formatMoney(grandTotal)}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className="border shadow-sm"
          style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder, color: LIGHT.pageText }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: LIGHT.mutedText }}>Total Products / Items</CardDescription>
            <CardTitle className="text-2xl font-bold" style={{ color: LIGHT.headingText }}>{items.length} Items</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className="border shadow-sm"
          style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder, color: LIGHT.pageText }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: LIGHT.mutedText }}>Transportation & Installation ({installPct}%)</CardDescription>
            <CardTitle className="text-2xl font-bold" style={{ color: LIGHT.gold }}>{formatMoney(installationFee)}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className="border shadow-sm"
          style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder, color: LIGHT.pageText }}
        >
          <CardHeader className="pb-2">
            <CardDescription style={{ color: LIGHT.mutedText }}>Net Estimated Payable</CardDescription>
            <CardTitle className="text-2xl font-bold" style={{ color: LIGHT.green }}>{formatMoney(netTotal)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card
        className="border shadow-sm break-inside-avoid"
        style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder, color: LIGHT.pageText }}
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-xl border shadow-sm"
                style={{ background: LIGHT.cardBg, borderColor: LIGHT.cardBorder }}
              >
                <img src={logoImg} alt="MAKc Logo" className="h-12 w-auto object-contain" />
              </div>
              <div>
                <CardTitle className="text-2xl" style={{ color: LIGHT.headingText }}>Experience The Smart Living</CardTitle>
                <CardDescription style={{ color: LIGHT.mutedText }}>Home automation project quotation breakdown</CardDescription>
              </div>
            </div>
            <div className="text-left text-sm md:text-right">
              <div className="font-semibold" style={{ color: LIGHT.mutedText }}>Net Project Value</div>
              <div className="text-xl font-bold" style={{ color: LIGHT.accent }}>{formatMoney(netTotal)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg border"
            style={{ borderColor: LIGHT.cardBorder, background: LIGHT.cardBg }}
          >
            <Table className="w-full table-auto" style={{ background: LIGHT.cardBg, color: LIGHT.pageText }}>
              <TableHeader style={{ background: LIGHT.headerBg }}>
                <TableRow style={{ borderColor: LIGHT.headerBorder }}>
                  {headers.map((header) => (
                    <TableHead
                      key={header}
                      className="text-xs font-semibold"
                      style={{ color: LIGHT.mutedText }}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, index) =>
                  row.type === "item" ? (
                    <TableRow
                      key={`${row.product}-${index}`}
                      className="break-inside-avoid"
                      style={{ borderColor: LIGHT.rowBorder, background: LIGHT.cardBg }}
                    >
                      <TableCell className="font-medium" style={{ color: LIGHT.bodyText }}>{row.application || "-"}</TableCell>
                      <TableCell style={{ color: LIGHT.bodyText }}>{row.floor || "-"}</TableCell>
                      <TableCell style={{ color: LIGHT.bodyText }}>{row.area || "-"}</TableCell>
                      <TableCell className="font-bold" style={{ color: LIGHT.headingText }}>{row.product}</TableCell>
                      <TableCell className="font-bold text-center" style={{ color: LIGHT.accent }}>{row.quantity || "-"}</TableCell>
                      <TableCell style={{ color: LIGHT.bodyText }}>{formatMoney(row.price)}</TableCell>
                      <TableCell className="font-bold" style={{ color: LIGHT.accent }}>{formatMoney(row.totalPrice)}</TableCell>
                      <TableCell className="font-bold" style={{ color: LIGHT.headingText }}>{row.brand || "-"}</TableCell>
                      <TableCell className="font-bold" style={{ color: LIGHT.green }}>{formatWarranty(row.warranty)}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow
                      key={`${row.label}-${index}`}
                      className="font-bold break-inside-avoid"
                      style={{ background: LIGHT.summaryBg, borderColor: LIGHT.headerBorder }}
                    >
                      <TableCell colSpan={6} className="uppercase text-xs tracking-wider" style={{ color: LIGHT.accentStrong }}>
                        {row.label}
                      </TableCell>
                      <TableCell style={{ color: LIGHT.accent }}>{formatMoney(row.totalPrice)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-right text-xs" style={{ color: LIGHT.mutedText }}>
            All prices inclusive of applicable taxes, product, delivery and installation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
