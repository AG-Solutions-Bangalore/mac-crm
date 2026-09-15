import React from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Top bar: navigation + view switcher + dynamic installation % input +
// Export Excel / Print-Save PDF actions (original header layout).
// This bar is `quotation-no-print` so it never appears in print output.
export default function ReportHeaderActions({
  quotationNo,
  viewMode,
  setViewMode,
  onNavigateBack,
  installPct,
  onInstallPctChange,
  onExportExcel,
  onPrint,
}) {
  return (
    <div className="quotation-no-print flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card text-card-foreground border border-border p-3 md:p-4 rounded-xl shadow-md sticky top-0 z-auto">
      {/* Title & Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Quotation #{quotationNo}
          </h1>
        </div>
      </div>

      {/* View switcher + dynamic installation % + export actions */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Tab View Switcher */}
        <div className="bg-muted p-1 rounded-lg border border-border flex items-center mr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("presentation")}
            className={`text-xs font-semibold transition-all cursor-pointer ${viewMode === "presentation"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1.5 text-sky-500" /> PDF Presentation
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={`text-xs font-semibold transition-all cursor-pointer ${viewMode === "table"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-500" /> Compact Data Table
          </Button>
        </div>

        {/* Dynamic Transportation & Installation % — same height as switcher pill */}
        <label
          className="flex h-[46px] shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold focus-within:border-sky-400"
          title="Transportation & installation charge %"
        >
          <span className="whitespace-nowrap text-muted-foreground">
            Install %
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={installPct}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onInstallPctChange(Number.isNaN(v) ? 0 : Math.min(100, Math.max(0, v)));
            }}
            onFocus={(e) => e.target.select()}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-10 bg-transparent text-center text-xs font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </label>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="h-[46px] font-medium bg-background text-foreground border-border hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Export Excel
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onPrint}
          className="h-[46px] bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-sm border-none"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
