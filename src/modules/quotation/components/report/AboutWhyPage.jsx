import React from "react";
import { Award, CheckCircle2, Zap, Shield, Users, Headphones, Star, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";

const WHY_ITEMS = [
  { icon: Globe, title: "100% Made In India", desc: "World-class components, locally crafted with precision engineering." },
  { icon: Zap, title: "Professional Design", desc: "Bespoke electrical & wireless system layout for every home." },
  { icon: Users, title: "Certified Engineers", desc: "Trained, experienced team ensuring hassle-free deployment." },
  { icon: Star, title: "Premium Products", desc: "High-durability hardware with sleek, tactile finish." },
  { icon: Shield, title: "Best Service SLA", desc: "Dedicated account manager & priority on-site support." },
  { icon: Headphones, title: "24/7 Remote Support", desc: "Cloud-based diagnosis, monitoring & instant updates." },
];

const AWARDS = [
  { award: "Best Home Automation Solutions in Bangalore", org: "Blindwink Achiever's Award 2022" },
  { award: "India's Most Trusted Brand of the Year 2024", org: "My Brand Better 2024" },
  { award: "Best Home Automation Company from Bangalore", org: "Udyog Yogdaan Puraskar 2026" },
];

const SERVICES = [
  "Smart Touch Switches", "Curtains & Blinds Automation", "Door & Gate Automation",
  "Architectural Lighting", "High-Speed Networking", "CCTV & Surveillance",
];

export default function AboutWhyPage({ heroImage, clientName, pdfTheme = "dark" }) {
  const isLight = pdfTheme === "light";
  return (
    <div
      className="makc-page makc-cover-page flex flex-col justify-between"
      style={{
        background: isLight ? "#ffffff" : "#06090f",
        color: isLight ? "#0f172a" : "#fff",
        fontFamily: "'Inter', sans-serif",
        padding: "0",
        height: "297mm",
        maxHeight: "297mm",
        boxSizing: "border-box",
        overflow: "hidden",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* ─── HEADER ─── */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 36px 16px",
        }}
      >
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", color: isLight ? "#b45309" : "#d4af37", textTransform: "uppercase", margin: 0, marginBottom: "4px" }}>
            ✦ Company Profile
          </p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: isLight ? "#0f172a" : "#ffffff" }}>
            About MAKc &amp; Our Excellence
          </h2>
          <p style={{ fontSize: "10px", color: isLight ? "#0284c7" : "#38bdf8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "3px 0 0" }}>
            Redefining Luxury Living — Engineering Trust Since Day One
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: isLight ? "#fef3c7" : "rgba(30,20,5,0.85)", border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.4)", borderRadius: "999px", padding: "5px 12px", fontSize: "9px", fontWeight: 700, color: isLight ? "#b45309" : "#d4af37" }}>
            <Award style={{ width: 12, height: 12 }} /> Award Winning
          </div>
          <div style={{ background: "#fff", borderRadius: "10px", padding: "5px 12px", boxShadow: isLight ? "0 2px 12px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.4)", border: isLight ? "1px solid #e2e8f0" : "none" }}>
            <img src={logoImg} alt="MAKc" style={{ height: "28px", objectFit: "contain" }} />
          </div>
        </div>
      </div>

      {/* ─── BODY (Stretches nicely to fill A4) ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "22px 36px",
        }}
      >
        {/* Brand intro paragraph */}
        <p style={{ fontSize: "11.5px", color: isLight ? "#475569" : "#94a3b8", lineHeight: 1.75, margin: 0 }}>
          At <strong style={{ color: isLight ? "#0f172a" : "#e2e8f0" }}>MAKc Automation and Solutions LLP</strong>, we craft bespoke smart-home ecosystems
          engineered for peak reliability, security, and effortless elegance. Our turnkey solutions blend
          cutting-edge technology with artisan craftsmanship — delivering an experience that truly embodies{" "}
          <em style={{ color: isLight ? "#0284c7" : "#38bdf8" }}>The Smart Living</em>.
        </p>

        {/* Service Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {SERVICES.map((s, i) => (
            <span
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: isLight ? "#f1f5f9" : "rgba(15,23,42,0.9)",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(56,189,248,0.25)",
                borderRadius: "999px", padding: "5px 14px",
                fontSize: "10px", fontWeight: 600, color: isLight ? "#0369a1" : "#7dd3fc",
              }}
            >
              <CheckCircle2 style={{ width: 11, height: 11, color: isLight ? "#0284c7" : "#38bdf8" }} />{s}
            </span>
          ))}
        </div>

        {/* Hero image showcase */}
        <div
          style={{
            position: "relative", borderRadius: "14px", overflow: "hidden",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.15)", height: "200px",
            boxShadow: isLight ? "0 8px 24px rgba(0,0,0,0.1)" : "0 10px 36px rgba(0,0,0,0.6)", flexShrink: 0,
          }}
        >
          <img src={heroImage} alt="MAKc Smart Home" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: isLight ? "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 60%)" : "linear-gradient(to top, rgba(6,9,15,0.9) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: "16px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.15em", color: isLight ? "#0284c7" : "#38bdf8", textTransform: "uppercase", margin: 0 }}>Intelligent Craftsmanship</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: isLight ? "#0f172a" : "#fff", margin: "3px 0 0" }}>Seamless Control at Your Fingertips</p>
            </div>
            <span style={{ fontSize: "9.5px", color: isLight ? "#475569" : "#94a3b8", background: isLight ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.85)", border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.2)", borderRadius: "6px", padding: "4px 12px", backdropFilter: "blur(4px)" }}>
              ISO 9001:2015
            </span>
          </div>
        </div>

        {/* Why MAKc heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
          <p style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.2em", color: isLight ? "#b45309" : "#d4af37", textTransform: "uppercase", margin: 0 }}>Why Choose MAKc?</p>
          <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
        </div>

        {/* Why MAKc grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  background: isLight ? "#f8fafc" : "rgba(15,23,42,0.9)",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(148,163,184,0.14)",
                  borderRadius: "12px", padding: "12px 14px",
                  boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: isLight ? "#e0f2fe" : "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 12, height: 12, color: isLight ? "#0284c7" : "#38bdf8" }} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: isLight ? "#0f172a" : "#e2e8f0" }}>{item.title}</span>
                </div>
                <p style={{ fontSize: "9px", color: isLight ? "#475569" : "#64748b", lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Awards Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
            <p style={{ fontSize: "9.5px", fontWeight: 800, letterSpacing: "0.2em", color: isLight ? "#b45309" : "#d4af37", textTransform: "uppercase", margin: 0 }}>
              🏆 Recognition &amp; Awards
            </p>
            <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {AWARDS.map((awd, i) => (
              <div
                key={i}
                style={{
                  background: isLight ? "#f8fafc" : "rgba(15,23,42,0.9)",
                  border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.35)",
                  borderRadius: "12px", padding: "14px 12px",
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "6px",
                  boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: isLight ? "#fef3c7" : "rgba(212,175,55,0.12)", border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award style={{ width: 15, height: 15, color: isLight ? "#b45309" : "#d4af37" }} />
                </div>
                <p style={{ fontSize: "10.5px", fontWeight: 700, color: isLight ? "#0f172a" : "#f1f5f9", margin: 0, lineHeight: 1.4 }}>{awd.award}</p>
                <span style={{ fontSize: "8.5px", color: isLight ? "#b45309" : "#d4af37", fontWeight: 600 }}>{awd.org}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div
        style={{
          padding: "12px 36px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "9.5px", color: isLight ? "#64748b" : "#475569",
        }}
      >
        <span>MAKc Automation and Solutions LLP · ISO 9001:2015 Certified</span>
        <span style={{ color: isLight ? "#b45309" : "#d4af37", fontWeight: 600 }}>Page 2 — Company Overview</span>
      </div>
    </div>
  );
}
