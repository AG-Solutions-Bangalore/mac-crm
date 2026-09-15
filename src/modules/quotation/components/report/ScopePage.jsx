import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import logoImg from "@/assets/logo.png";

export default function ScopePage({ items, quotationNo }) {
  return (
    <div className="makc-page makc-page-dynamic text-white p-8 md:p-12 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Scope of Work</h2>
          <p className="text-xs text-sky-400 tracking-wider uppercase font-semibold">
            Itemized Hardware & Systems Schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-400">
            <span>Quotation #{quotationNo}</span>
          </div>
          <div className="bg-white/95 p-1.5 rounded-xl border border-white/40 shadow-sm">
            <img src={logoImg} alt="MAKc Logo" className="h-12 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Scope Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl mb-6">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 text-xs font-bold">#</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold">Product / System Specification</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold">Application / Area</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold text-center">Qty</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold">Brand</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold">Warranty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx} className="border-slate-800/80 hover:bg-slate-850 break-inside-avoid">
                <TableCell className="text-xs text-slate-500 font-mono">{idx + 1}</TableCell>
                <TableCell className="text-xs">
                  <div className="font-semibold text-slate-100">{item.product}</div>
                  <div className="text-[10px] text-slate-400">{item.notes}</div>
                </TableCell>
                <TableCell className="text-xs text-slate-300">
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] border border-slate-700">
                    {item.application} ({item.floor})
                  </span>
                </TableCell>
                <TableCell className="text-xs font-bold text-sky-400 text-center">{item.quantity}</TableCell>
                <TableCell className="text-xs text-slate-300">{item.brand}</TableCell>
                <TableCell className="text-xs text-emerald-400">{item.warranty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 mt-auto">
        <p>All items supplied with original manufacturer warranty & MAKc installation assurance.</p>
        <span>Scope Schedule</span>
      </div>
    </div>
  );
}
