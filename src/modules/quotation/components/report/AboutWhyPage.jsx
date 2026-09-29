import { MapPin, Phone, Mail, Home, Layers } from "lucide-react";
import React from "react";
import { Award, CheckCircle2, Zap, Shield, Users, Headphones, Star, Globe } from "lucide-react";
import logoImg from "@/assets/logo.png";

const WHY_ITEMS = [
  { icon: Globe, title: "100% Made In India", desc: "World-class components, locally crafted with precision engineering." },
  { icon: Zap, title: "Professional Design", desc: "Bespoke electrical & wireless system layout for every home." },
  { icon: Users, title: "Certified Engineers", desc: "Trained, experienced team ensuring hassle-free deployment." },
  { icon: Star, title: "Premium Products", desc: "High-durability hardware with sleek, tactile finish." },
  { icon: Shield, title: "Service Excellence", desc: "Dedicated support with priority on-site assistance & care." },
  { icon: Headphones, title: "24/7 Remote Support", desc: "Cloud-based diagnosis, monitoring & instant updates." },
];

const AWARDS = [
  { award: "Best Home Automation Solutions in Bangalore", org: "Blindwink Achiever's Award 2022" },
  { award: "India's Most Trusted Brand of the Year 2024", org: "My Brand Better 2024" },
  { award: "Best Home Automation Company from Bangalore", org: "Udyog Yogdaan Puraskar 2026" },
];

const SERVICES = [
  "Smart Touch Switches", "Curtains & Blinds Automation", "Door & Gate Automation",
  "Architectural Lighting", "Room Audio", "High-Speed Networking", "CCTV & Security",
];

export default function AboutWhyPage({ heroImage, clientName }) {
  const isLight = true; // Light-only theme (theme switcher removed)
  // Shared font — ui-sans-serif on every text in this page
  const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  return (
    <div
      className="makc-page makc-about-why-page flex flex-col justify-between"
      style={{
        background: isLight ? "#ffffff" : "#06090f",
        color: isLight ? "#0f172a" : "#fff",
        fontFamily: FONT,
        padding: "0",
        width: "100%",
        maxWidth: "210mm",
        height: "296mm",
        maxHeight: "296mm",
        boxSizing: "border-box",
        overflow: "hidden",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakBefore: "always",
        breakBefore: "page",
        pageBreakAfter: "avoid",
        breakAfter: "avoid",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Enforce ui-sans-serif on every text in this page */}
      <style>{`.makc-page, .makc-page * { font-family: ${FONT} !important; }`}</style>
      {/* ─── HEADER ─── */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 32px 10px",
        }}
      >
        <div>
          <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.18em", color: isLight ? "#b45309" : "#d4af37", textTransform: "uppercase", margin: 0, marginBottom: "3px" }}>
            ✦ Company Profile
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: isLight ? "#0f172a" : "#ffffff" }}>
            About MAKc &amp; Our Excellence
          </h2>
          <p style={{ fontSize: "9.5px", color: isLight ? "#0284c7" : "#38bdf8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "2px 0 0" }}>
            Redefining Luxury Living — Engineering Trust Since Day One
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: isLight ? "#fef3c7" : "rgba(30,20,5,0.85)", border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.4)", borderRadius: "999px", padding: "4px 10px", fontSize: "8.5px", fontWeight: 700, color: isLight ? "#b45309" : "#d4af37" }}>
            <Award style={{ width: 11, height: 11 }} /> Award Winning
          </div>
          {/* Logo only — transparent asset, no box/background/border/shadow anywhere */}
          <img src={logoImg} alt="MAKc" style={{ height: "44px", objectFit: "contain", display: "block", background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", outline: "none" }} />
        </div>
      </div>

      {/* ─── BODY (Stretches nicely to fill A4) ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "10px 32px",
          gap: "8px",
        }}
      >
        {/* Brand intro paragraph */}
        <p style={{ fontSize: "10.5px", color: isLight ? "#475569" : "#94a3b8", lineHeight: 1.55, margin: 0 }}>
          At <strong style={{ color: isLight ? "#0f172a" : "#e2e8f0" }}>MAKc Automation and Solutions LLP</strong>, we craft bespoke smart-home ecosystems
          engineered for peak reliability, security, and effortless elegance. Our turnkey solutions blend
          cutting-edge technology with artisan craftsmanship — delivering an experience that truly embodies{" "}
          <em style={{ color: isLight ? "#0284c7" : "#38bdf8" }}>The Smart Living</em>.
        </p>

        {/* Service Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {SERVICES.map((s, i) => (
            <span
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: isLight ? "#f1f5f9" : "rgba(15,23,42,0.9)",
                border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(56,189,248,0.25)",
                borderRadius: "999px", padding: "4px 10px",
                fontSize: "9px", fontWeight: 600, color: isLight ? "#0369a1" : "#7dd3fc",
              }}
            >
              <CheckCircle2 style={{ width: 10, height: 10, color: isLight ? "#0284c7" : "#38bdf8" }} />{s}
            </span>
          ))}
        </div>

        {/* Hero image showcase */}
        <div
          style={{
            position: "relative", borderRadius: "12px", overflow: "hidden",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.15)", height: "155px",
            boxShadow: isLight ? "0 6px 18px rgba(0,0,0,0.08)" : "0 8px 28px rgba(0,0,0,0.5)", flexShrink: 0,
          }}
        >
          <img src={heroImage} alt="MAKc Smart Home" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: isLight ? "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 60%)" : "linear-gradient(to top, rgba(6,9,15,0.9) 0%, transparent 60%)" }} />
          <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", color: isLight ? "#0284c7" : "#38bdf8", textTransform: "uppercase", margin: 0 }}>Intelligent Craftsmanship</p>
              <p style={{ fontSize: "15px", fontWeight: 800, color: isLight ? "#0f172a" : "#fff", margin: "2px 0 0" }}>Seamless Control at Your Fingertips</p>
            </div>
            <span style={{ fontSize: "9px", color: isLight ? "#475569" : "#94a3b8", background: isLight ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.85)", border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.2)", borderRadius: "6px", padding: "3px 10px", backdropFilter: "blur(4px)" }}>
              ISO 9001:2015
            </span>
          </div>
        </div>

        {/* Why MAKc heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
          <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: isLight ? "#b45309" : "#d4af37", margin: 0 }}>Why choose MAKc?</p>
          <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
        </div>

        {/* Why MAKc grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  background: isLight ? "#f8fafc" : "rgba(15,23,42,0.9)",
                  border: isLight ? "1px solid #e2e8f0" : "1px solid rgba(148,163,184,0.14)",
                  borderRadius: "10px", padding: "8px 10px",
                  boxShadow: isLight ? "0 2px 8px rgba(0,0,0,0.02)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: isLight ? "#e0f2fe" : "rgba(56,189,248,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 11, height: 11, color: isLight ? "#0284c7" : "#38bdf8" }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: isLight ? "#0f172a" : "#e2e8f0" }}>{item.title}</span>
                </div>
                <p style={{ fontSize: "8.5px", color: isLight ? "#475569" : "#64748b", lineHeight: 1.35, margin: 0, fontWeight: 500 }}>{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Awards Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
            <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", color: isLight ? "#b45309" : "#d4af37", textTransform: "uppercase", margin: 0 }}>
              🏆 Recognition &amp; Awards
            </p>
            <div style={{ flex: 1, height: "1px", background: isLight ? "#e2e8f0" : "rgba(148,163,184,0.15)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {AWARDS.map((awd, i) => (
              <div
                key={i}
                style={{
                  background: isLight ? "#f8fafc" : "rgba(15,23,42,0.9)",
                  border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.35)",
                  borderRadius: "10px", padding: "8px 10px",
                  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "4px",
                  boxShadow: isLight ? "0 2px 8px rgba(0,0,0,0.02)" : "none",
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: isLight ? "#fef3c7" : "rgba(212,175,55,0.12)", border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award style={{ width: 13, height: 13, color: isLight ? "#b45309" : "#d4af37" }} />
                </div>
                <p style={{ fontSize: "9.5px", fontWeight: 700, color: isLight ? "#0f172a" : "#f1f5f9", margin: 0, lineHeight: 1.3 }}>{awd.award}</p>
                <span style={{ fontSize: "8px", color: isLight ? "#b45309" : "#d4af37", fontWeight: 600 }}>{awd.org}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div
        style={{
          padding: "6px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "8.5px", color: isLight ? "#64748b" : "#475569",
        }}
      >
        <span>MAKc Automation and Solutions LLP · ISO 9001:2015 Certified</span>
        <span style={{ color: isLight ? "#b45309" : "#d4af37", fontWeight: 600 }}>Company Overview</span>
      </div>

      {/* ─── FOOTER 2 ─── */}
      <div
        style={{
          padding: "8px 32px",
          borderTop: "1px solid #e2e8f0",
          background: "linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", gap: "16px", fontSize: "8.5px", color: "#0f172a" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin style={{ width: 9, height: 9, color: isLight ? "#0284c7" : "#38bdf8" }} />
            BEML Layout, Brookfield, Bangalore – 560066
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone style={{ width: 9, height: 9, color: isLight ? "#0284c7" : "#38bdf8" }} />
            +91-7338504441
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Mail style={{ width: 9, height: 9, color: isLight ? "#0284c7" : "#38bdf8" }} />
            vinod@makcautomations.com
          </span>
        </div>
        <span style={{ fontSize: "8.5px", color: isLight ? "#b45309" : "#fbbf24", fontWeight: 700, letterSpacing: "0.05em" }}>
          Commercial Proposal — Confidential
        </span>
      </div>
    </div>
  );
}
