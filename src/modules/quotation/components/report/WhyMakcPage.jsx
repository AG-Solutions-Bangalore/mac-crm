import React from "react";
import { Award, Sparkles } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function WhyMakcPage() {
  return (
    <div className="makc-page text-white p-8 md:p-12 flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-3xl font-black text-white">Why MAKc ?</h2>
          <p className="text-xs text-sky-400 tracking-wider uppercase font-semibold">
            Unmatched Quality & Engineering Trust
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-300">
            <Award className="w-4 h-4 text-amber-400" /> Award Winning Brand
          </div>
          <div className="bg-white/95 p-1.5 rounded-xl border border-white/40 shadow-sm">
            <img src={logoImg} alt="MAKc Logo" className="h-7 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Why MAKc Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-2">
        {[
          { title: "100% Made In India", desc: "Crafted locally with world-class standard components" },
          { title: "Professional Design", desc: "Bespoke electrical & wireless automation layout" },
          { title: "Certified Installation Team", desc: "Trained engineers for hassle-free deployment" },
          { title: "Premium Products", desc: "Tested for high durability and sleek tactile finish" },
          { title: "Best Service", desc: "Dedicated account manager & SLA support" },
          { title: "Technical & Remote Support", desc: "24/7 cloud diagnosis & over-the-air updates" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-sky-500/40 transition-all"
          >
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-sky-400" />
              {item.title}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Quote Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 rounded-2xl p-6 text-center my-3 shadow-xl">
        <p className="text-sm md:text-base italic text-slate-200 font-light max-w-xl mx-auto">
          &ldquo;We design intelligent homes that give you complete control, security and luxury with professional installation and support.&rdquo;
        </p>
      </div>

      {/* THE AWARDS SECTION */}
      <div className="my-2">
        <div className="text-center mb-4">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-[0.25em]">
            Recognition & Excellence
          </span>
          <h3 className="text-2xl font-black text-white mt-0.5">THE AWARDS</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              award: "Best Home Automation Solutions in Bangalore",
              org: "Blindwink India Achiever's Award 2022",
            },
            {
              award: "India's Most Trusted Brand of the Year 2024",
              org: "My Brand Better 2024",
            },
            {
              award: "Best Home Automation Company from Bangalore",
              org: "Udyog Yogdaan Puraskar 2026",
            },
          ].map((awd, index) => (
            <div
              key={index}
              className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl text-center flex flex-col items-center justify-between hover:border-amber-400/60 transition-all shadow-lg"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-100 leading-tight mb-2">{awd.award}</p>
              <span className="text-[10px] text-amber-400 font-medium">{awd.org}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
        <span>MAKc Automation and Solutions LLP</span>
        <span>Page 3</span>
      </div>
    </div>
  );
}
