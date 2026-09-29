import React from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PCT_PRESETS = [5, 7, 10, 15];

// Top bar: navigation + view switcher + Consultancy / Installation % inputs +
// Prepared-by selector + Export Excel / Print-Save PDF actions.
// This bar is `quotation-no-print` so it never appears in print output.
export default function ReportHeaderActions({
  quotationNo,
  viewMode,
  setViewMode,
  onNavigateBack,
  consultancyPct = 5,
  onConsultancyPctChange,
  installPct = 5,
  onInstallPctChange,
  preparedById,
  onPreparedByChange,
  preparedByOptions = [],
  onExportExcel,
  onPrint,
}) {
  const renderPctInput = (label, value, onChange, listId, title) => (
    <label
      className="flex h-[46px] shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold focus-within:border-sky-400"
      title={title}
    >
      <span className="whitespace-nowrap text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        list={listId}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange?.(Number.isNaN(v) ? 0 : Math.min(100, Math.max(0, v)));
        }}
        onFocus={(e) => e.target.select()}
        onWheel={(e) => e.currentTarget.blur()}
        className="w-10 bg-transparent text-center text-xs font-bold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <datalist id={listId}>
        {PCT_PRESETS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </label>
  );

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

      {/* View switcher + charge % + prepared-by + export actions */}
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

        {/* Consultancy & Design % — presets 5/7/10/15 or any custom value */}
        {renderPctInput(
          "Consultancy %",
          consultancyPct,
          onConsultancyPctChange,
          "makc-consultancy-presets",
          "Consultancy & Design charge % of grand total (5 / 7 / 10 / 15 or custom)"
        )}

        {/* Installation % — presets 5/7/10/15 or any custom value */}
        {renderPctInput(
          "Install %",
          installPct,
          onInstallPctChange,
          "makc-install-presets",
          "Installation charge % of grand total (5 / 7 / 10 / 15 or custom)"
        )}

        {/* Prepared-by selector */}
        {preparedByOptions.length > 0 && (
          <label
            className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold focus-within:border-sky-400"
            title="Prepared by"
          >
            <span className="whitespace-nowrap text-muted-foreground">
              Prepared By
            </span>
            <select
              value={preparedById}
              onChange={(e) => onPreparedByChange?.(e.target.value)}
              className="max-w-[170px] bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
            >
              {preparedByOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.phone}
                </option>
              ))}
            </select>
          </label>
        )}

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
