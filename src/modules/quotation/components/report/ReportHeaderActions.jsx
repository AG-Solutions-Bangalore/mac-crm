import React from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  LayoutGrid,
  Layers,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportHeaderActions({
  quotationNo,
  isRevised,
  viewMode,
  setViewMode,
  pdfTheme = "dark",
  setPdfTheme,
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
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
              ISO 9001:2015
            </span>
          </h1>
        </div>
      </div>

      {/* Action Buttons (Light & Dark Mode Compatible Tabs) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tab View Switcher */}
        <div className="bg-muted p-1 rounded-lg border border-border flex items-center mr-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("presentation")}
            className={`text-xs font-semibold transition-all ${
              viewMode === "presentation"
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
            className={`text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-sky-500" /> Compact Data Table
          </Button>
        </div>

        {/* PDF Theme Switcher (Dark vs Light) */}
        {setPdfTheme && (
          <div className="bg-muted p-1 rounded-lg border border-border flex items-center mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPdfTheme("dark")}
              className={`text-xs font-semibold transition-all ${
                pdfTheme === "dark"
                  ? "bg-slate-900 text-sky-400 shadow-sm border border-slate-700 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              title="Dark Luxury PDF Export Mode"
            >
              <Moon className="w-3.5 h-3.5 mr-1 text-sky-400" /> Dark PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPdfTheme("light")}
              className={`text-xs font-semibold transition-all ${
                pdfTheme === "light"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-300 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              title="Light Executive PDF Export Mode"
            >
              <Sun className="w-3.5 h-3.5 mr-1 text-amber-500" /> Light PDF
            </Button>
          </div>
        )}

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
