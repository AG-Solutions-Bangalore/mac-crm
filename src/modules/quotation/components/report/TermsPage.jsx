import React from "react";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function TermsPage({ clientName }) {
  return (
    <div className="makc-page makc-page-dynamic text-white p-8 md:p-12 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-3xl font-black text-white">Terms & Conditions</h2>
          <p className="text-xs text-sky-400 tracking-wider uppercase font-semibold">
            Warranty Policy & Bank Transfer Info
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-400">
            <span>MAKc Governance</span>
          </div>
          <div className="bg-white/95 p-1.5 rounded-xl border border-white/40 shadow-sm">
            <img src={logoImg} alt="MAKc Logo" className="h-7 w-auto object-contain" />
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs text-slate-300 mb-6">
        {/* Civil & Electrical Scope */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl break-inside-avoid">
          <h4 className="font-bold text-white text-sm mb-1 text-sky-400">Civil & Electrical Works</h4>
          <p className="text-slate-400 leading-relaxed">
            All civil, electrical, back-box installation, and conduit wiring required for installation shall be completed by the customer prior to deployment. MAKc shall not be held responsible for site readiness delays.
          </p>
        </div>

        {/* Warranty Terms */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2 break-inside-avoid">
          <h4 className="font-bold text-white text-sm text-sky-400">Standard Warranty Coverage</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>• <strong>Smart Touch Switches:</strong> 5-Year Replacement Warranty</div>
            <div>• <strong>Curtain Motors & Tracks:</strong> 5-Year Motor Warranty</div>
            <div>• <strong>Smart Lights & Drivers:</strong> 2-Year Full Warranty</div>
            <div>• <strong>Sensors & Gate Automation:</strong> 2-Year Replacement</div>
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl break-inside-avoid">
          <h4 className="font-bold text-white text-sm mb-1 text-amber-400">Scope Exclusions</h4>
          <p className="text-slate-400 leading-relaxed">
            Electrical main cabling, concealed piping, third-party internet routers/switches, and wire labeling are outside MAKc scope unless explicitly listed in item schedule.
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-sky-500/40 p-4 rounded-2xl shadow-xl break-inside-avoid">
          <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            Bank Payment Details
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
            <div><span className="text-slate-400">Account Name:</span> <strong className="text-white">MAKc Automation and Solutions LLP</strong></div>
            <div><span className="text-slate-400">Bank Name:</span> <strong className="text-white">ICICI Bank</strong></div>
            <div><span className="text-slate-400">Account Number:</span> <strong className="text-sky-400 font-mono">777705435168</strong></div>
            <div><span className="text-slate-400">IFSC Code:</span> <strong className="text-sky-400 font-mono">ICIC0000561</strong></div>
          </div>
        </div>
      </div>

      {/* Signature Sign-offs (prevent breaking inside) */}
      <div className="my-2 pt-4 border-t border-slate-800 grid grid-cols-2 gap-8 break-inside-avoid">
        <div className="space-y-1">
          <p className="text-xs text-slate-400">Prepared & Authorised By:</p>
          <p className="text-sm font-bold text-white">MAKc Automation and Solutions LLP</p>
          <div className="h-10 flex items-end">
            <span className="text-[10px] text-sky-400 italic">Digitally Signed & Validated</span>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <p className="text-xs text-slate-400">Client Approval & Signature:</p>
          <p className="text-sm font-bold text-white">{clientName}</p>
          <div className="h-10 border-b border-slate-700 ml-auto w-48" />
          <p className="text-[10px] text-slate-500 pt-1">Date: ________________________</p>
        </div>
      </div>

      {/* Footer Contact Info */}
      <div className="pt-4 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400 mt-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-400" /> BEML Layout, Brookfield, Bangalore – 560066</span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-sky-400" /> +91-7338504441</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-sky-400" /> vinod@makcautomations.com</span>
        </div>
        <span>Terms & Approval</span>
      </div>
    </div>
  );
}
