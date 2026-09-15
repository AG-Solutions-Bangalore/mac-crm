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

export default function PricingPage({
  items,
  formatMoney,
  grandTotal,
  installationFee,
  gstTax,
  netTotal,
  paymentRows,
}) {
  return (
    <div className="makc-page makc-page-dynamic text-white p-8 md:p-12 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Investment & Pricing</h2>
          <p className="text-xs text-sky-400 tracking-wider uppercase font-semibold">
            Transparent Commercial Schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-400">
            <div className="text-sky-400 font-bold">MAKc Commercials</div>
          </div>
          <div className="bg-white/95 p-1.5 rounded-xl border border-white/40 shadow-sm">
            <img src={logoImg} alt="MAKc Logo" className="h-12 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 mb-6 shadow-xl">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-400 text-xs font-bold">Item Name</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold text-center">Qty</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold text-right">Unit Price</TableHead>
              <TableHead className="text-slate-400 text-xs font-bold text-right">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i} className="border-slate-800/60 break-inside-avoid">
                <TableCell className="text-xs font-medium text-slate-200">{item.product}</TableCell>
                <TableCell className="text-xs text-center font-semibold text-slate-300">{item.quantity}</TableCell>
                <TableCell className="text-xs text-right text-slate-300">{formatMoney(item.price)}</TableCell>
                <TableCell className="text-xs text-right font-bold text-sky-400">{formatMoney(item.totalPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Financial Summary & Payment Milestones Container */}
      <div className="space-y-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl ml-auto max-w-md space-y-2 break-inside-avoid">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Hardware Subtotal</span>
            <span className="font-semibold text-white">{formatMoney(grandTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Transportation & Installation (5% est.)</span>
            <span className="font-semibold text-white">{formatMoney(installationFee)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>GST Taxes (18%)</span>
            <span className="font-semibold text-amber-400">{formatMoney(gstTax)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
            <span className="text-sm font-extrabold text-white">Net Project Price</span>
            <span className="text-2xl font-black text-sky-400">{formatMoney(netTotal)}</span>
          </div>
        </div>

        {/* Payment Roadmap */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2.5">
          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest">Payment Milestones</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            {paymentRows.map((pay, pIdx) => (
              <div key={pIdx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="text-xs font-bold text-sky-400">{pay.percentage}</span>
                <p className="text-[11px] font-semibold text-white mt-0.5">{pay.label}</p>
                <p className="text-xs text-slate-400 mt-1">{formatMoney(pay.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 mt-auto">
        <span>Prices inclusive of standard support & configuration.</span>
        <span>Commercial Schedule</span>
      </div>
    </div>
  );
}
