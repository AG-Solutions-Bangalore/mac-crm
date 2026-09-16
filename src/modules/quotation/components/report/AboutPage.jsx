import React from "react";
import { CheckCircle2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function AboutPage({ heroImage, clientName }) {
  return (
    <div className="makc-page text-white p-8 md:p-12 flex flex-col justify-between">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white">About MAKc</h2>
          <p className="text-xs text-sky-400 tracking-wider uppercase font-semibold">
            Redefining Luxury Living
          </p>
        </div>
        <div className="bg-white/95 p-2 rounded-xl border border-white/40 shadow-sm">
          <img src={logoImg} alt="MAKc Logo" className="h-12 w-auto object-contain" />
        </div>
      </div>

      {/* Brand Vision Text */}
      <div className="space-y-4 my-4 text-slate-300 text-sm leading-relaxed">
        <p className="text-base font-medium text-slate-100">
          At MAKc, we redefine luxury living through intelligent, bespoke home automation. From intuitive touch switches and motorized curtains to enterprise-grade networking and discreet security cameras, every solution is engineered for peak reliability and effortless elegance.
        </p>
        <p>
          Your space, your control. MAKc empowers you with unified automation tailored to your unique lifestyle, so every room feels effortless, secure, and extraordinary.
        </p>
      </div>

      {/* Feature Badges Grid */}
      <div className="flex flex-wrap gap-2.5 my-2">
        {[
          "Smart Switches",
          "Curtain Automation",
          "Door Automation",
          "Gate Automation",
          "Architectural Lighting",
          "High-Speed Networking",
          "CCTV Security",
          "Surveillance Systems",
        ].map((pill, i) => (
          <span
            key={i}
            className="px-4 py-2 bg-gradient-to-r from-blue-900/50 to-slate-900 border border-blue-500/30 text-blue-200 text-xs font-semibold rounded-full flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            {pill}
          </span>
        ))}
      </div>

      {/* Hero Showcase Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 my-4 h-72 shadow-2xl">
        <img
          src={heroImage}
          alt="MAKc Smart Home Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
          <div>
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
              Intelligent Craftsmanship
            </span>
            <h3 className="text-xl font-bold text-white">Seamless Control at Your Fingertips</h3>
          </div>
          <div className="text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 backdrop-blur">
            Certified Installation Standards
          </div>
        </div>
      </div>

      {/* Signature Sign-off */}
      <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
        <div>
          <p className="text-xs text-slate-400">Yours Sincerely,</p>
          <p className="text-sm font-bold text-white">MAKc Automation and Solutions LLP</p>
        </div>
        <div className="text-right">
          <div className="w-44 border-b border-slate-600 mb-1" />
          <p className="text-xs text-slate-400">Customer Signature & Approval ({clientName})</p>
        </div>
      </div>
    </div>
  );
}
