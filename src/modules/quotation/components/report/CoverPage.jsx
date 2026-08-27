import React from "react";
import { ShieldCheck, Sliders, Layers, Lock, Wifi, Video } from "lucide-react";
import logoImg from "@/assets/logo.png";

const SERVICES = [
  { title: "Smart Switches", icon: Sliders },
  { title: "Curtains & Blinds", icon: Layers },
  { title: "Door Automation", icon: Lock },
  { title: "Networking", icon: Wifi },
  { title: "CCTV & Security", icon: Video },
];

export default function CoverPage({
  clientName,
  projectAddress,
  quotationNo,
  quotationDate,
  contactPerson,
  contactPhone,
  bgImage,
  pdfTheme = "dark",
}) {
  const isLight = pdfTheme === "light";
  return (
    <div
      className="makc-page makc-cover-page"
      style={{
        background: isLight ? "#ffffff" : "#06090f",
        color: isLight ? "#0f172a" : "#fff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        padding: "0",
        height: "297mm",
        maxHeight: "297mm",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* Background photo */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: isLight ? "brightness(0.95) saturate(0.85)" : "brightness(0.75) saturate(1.05)",
        }}
      />
      {/* Gradient overlay (minimal/subtle in dark mode) */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: isLight
            ? "linear-gradient(155deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.70) 50%, rgba(255,255,255,0.94) 100%)"
            : "linear-gradient(to top, rgba(6,9,15,0.70) 0%, rgba(6,9,15,0.10) 40%, rgba(6,9,15,0.25) 100%)",
        }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "16px 24px 0",
        }}
      >
        {/* Logo */}
        <div
          style={{
            background: "#fff", borderRadius: "8px",
            padding: "4px 10px",
            boxShadow: isLight ? "0 2px 10px rgba(0,0,0,0.1)" : "0 4px 16px rgba(0,0,0,0.5)",
            border: isLight ? "1px solid #e2e8f0" : "none",
          }}
        >
          <img src={logoImg} alt="MAKc" style={{ height: "28px", objectFit: "contain", display: "block" }} />
        </div>

        {/* ISO badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: isLight ? "#ecfdf5" : "rgba(6,40,24,0.88)",
            border: isLight ? "1px solid #a7f3d0" : "1px solid rgba(52,211,153,0.45)",
            borderRadius: "999px",
            padding: "3px 10px",
            fontSize: "8.5px", fontWeight: 700, color: isLight ? "#047857" : "#6ee7b7",
            letterSpacing: "0.04em",
          }}
        >
          <ShieldCheck style={{ width: 11, height: 11, color: isLight ? "#059669" : "#34d399" }} />
          ISO 9001:2015 Certified
        </div>
      </div>

      {/* ── HERO CONTENT ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          margin: "auto 0",
          borderRadius: "12px",
          maxWidth: "460px",
        }}
      >
        {/* Eyebrow label */}
        <div
          style={{
            display: "inline-flex", alignItems: "center",
            background: isLight ? "#fef3c7" : "rgba(212,175,55,0.15)",
            border: isLight ? "1px solid #fde047" : "1px solid rgba(212,175,55,0.4)",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.18em",
            color: isLight ? "#b45309" : "#fbbf24", textTransform: "uppercase",
            width: "fit-content", marginBottom: "10px",
          }}
        >
          ✦ Bespoke Smart Automation Proposal
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: "32px", fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.02em", margin: "0 0 8px",
            color: isLight ? "#0f172a" : "#ffffff",
            textShadow: isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          Experience the
          <br />
          <span
            style={{
              color: isLight ? "#0284c7" : "#38bdf8",
              fontWeight: 900,
              textShadow: isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 2px 12px rgba(56,189,248,0.5)",
            }}
          >
            Smart Living
          </span>
        </h1>

        <p
          style={{
            fontSize: "10.5px", color: isLight ? "#1e293b" : "#e2e8f0", fontWeight: 500,
            maxWidth: "380px", lineHeight: 1.55, margin: "0 0 14px",
            textShadow: isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 1px 6px rgba(0,0,0,0.8)",
          }}
        >
          Your premier home automation partner — transforming spaces into intelligent,
          luxury environments with effortless one-touch control.
        </p>

        {/* Gold separator */}
        <div
          style={{
            width: "44px", height: "2px",
            background: "linear-gradient(90deg,#d4af37,#f5d97e)",
            marginBottom: "12px",
          }}
        />

        {/* Client dedication */}
        <div>
          <p
            style={{
              fontSize: "8px", color: isLight ? "#475569" : "#cbd5e1", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 2px", fontWeight: 700,
            }}
          >
            Exclusively Prepared For
          </p>
          <p
            style={{
              fontSize: "16px", fontWeight: 900, color: isLight ? "#0f172a" : "#ffffff",
              margin: 0, letterSpacing: "-0.01em",
              textShadow: isLight ? "0 1px 2px rgba(255,255,255,0.9)" : "0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {clientName}
          </p>
        </div>
      </div>

      {/* ── FOOTER WRAPPER: SERVICE PILLS + METADATA CARD ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 24px 14px" }}>
        {/* Service Pills */}
        <div
          style={{
            display: "flex", gap: "6px",
            marginBottom: "8px",
          }}
        >
          {SERVICES.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: isLight ? "#f8fafc" : "rgba(15,23,42,0.88)",
                  border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.16)",
                  borderRadius: "6px", padding: "5px 3px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "3px",
                  boxShadow: isLight ? "0 2px 6px rgba(0,0,0,0.03)" : "none",
                }}
              >
                <div
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: isLight ? "#e0f2fe" : "rgba(56,189,248,0.12)",
                    display: "flex", alignItems: "center", justifyItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: 10, height: 10, color: isLight ? "#0284c7" : "#38bdf8" }} />
                </div>
                <span style={{ fontSize: "8px", fontWeight: 600, color: isLight ? "#1e293b" : "#cbd5e1", textAlign: "center", lineHeight: 1.2 }}>
                  {srv.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metadata Card */}
        <div
          style={{
            background: isLight ? "rgba(248,250,252,0.96)" : "rgba(15,23,42,0.94)",
            border: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.16)",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: isLight ? "0 4px 20px rgba(0,0,0,0.06)" : "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* Fields grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 20px",
            }}
          >
            {[
              { label: "Client / Project", value: clientName },
              { label: "Location", value: projectAddress },
              { label: "Quotation Ref", value: `#${quotationNo}`, color: isLight ? "#0284c7" : "#38bdf8" },
              { label: "Proposal Date", value: quotationDate },
            ].map((f, i) => (
              <div key={i}>
                <span
                  style={{
                    fontSize: "7.5px", color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 600,
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontSize: "10px", fontWeight: 700,
                    color: f.color || (isLight ? "#0f172a" : "#f1f5f9"),
                    marginTop: "1px", display: "block",
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px", height: "36px",
              background: isLight ? "#cbd5e1" : "rgba(148,163,184,0.18)",
              margin: "0 14px",
            }}
          />

          {/* Contact */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: "7.5px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 600 }}>
              Prepared By
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: isLight ? "#0f172a" : "#fff", display: "block", marginTop: "1px" }}>
              {contactPerson}
            </span>
            <span style={{ fontSize: "9.5px", color: isLight ? "#0284c7" : "#38bdf8", fontWeight: 600, display: "block" }}>
              {contactPhone}
            </span>
            <span style={{ fontSize: "7.5px", color: "#64748b", display: "block", marginTop: "1px" }}>
              MAKc Automation &amp; Solutions LLP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
