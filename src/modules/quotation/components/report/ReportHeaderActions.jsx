import React from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportHeaderActions({
  quotationNo,
  isRevised,
  viewMode,
  setViewMode,
  onNavigateBack,
  onExportExcel,
  onPrint,
}) {
  return (
    <div className="quotation-no-print flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card text-card-foreground border border-border p-4 rounded-xl shadow-md sticky top-0 z-auto">
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
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Quotation #{quotationNo}

          </h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tab View Switcher */}
        <div className="bg-muted p-1 rounded-lg border border-border flex items-center mr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("presentation")}
            className={`text-xs font-semibold transition-all ${viewMode === "presentation"
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
            className={`text-xs font-semibold transition-all ${viewMode === "table"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-500" /> Compact Data Table
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportExcel}
          className="font-medium bg-background text-foreground border-border hover:bg-muted"
        >
          <Download className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Export Excel
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onPrint}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-sm border-none"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  );
}
