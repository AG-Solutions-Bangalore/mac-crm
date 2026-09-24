import React from "react";
import { Sliders, Layers, Lock, Wifi, Video, Volume2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

const SERVICES = [
  { title: "Smart Switches", icon: Sliders },
  { title: "Curtains & Blinds", icon: Layers },
  { title: "Door Automation", icon: Lock },
  { title: "Networking", icon: Wifi },
  { title: "CCTV & Security", icon: Video },
  { title: "Sound & Light", icon: Volume2 },
];

// Light executive cover — white hero photo is the page background (≈72% height).
// Header logo, ISO seal, headline and caption all layer above it with a soft
// white veil so dark text stays crisp over the bright villa photo.
export default function CoverPage({
  clientName,
  projectAddress,
  quotationNo,
  quotationDate,
  contactPerson,
  contactPhone,
  bgImage,
}) {
  return (
    <div
      className="makc-page makc-cover-page"
      style={{
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        padding: 0,
        height: "297mm",
        maxHeight: "297mm",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
    >
      {/* ── HERO BACKGROUND — white villa photo, top 72% of page ── */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "72%", zIndex: 0,
          overflow: "hidden",
        }}
      >
        <img
          src={bgImage}
          alt="Smart home"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%", display: "block" }}
        />
        {/* Soft white veil — keeps dark overlay text crisp while photo shows through */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 32%, rgba(255,255,255,0.28) 58%, rgba(255,255,255,0.55) 82%, #ffffff 100%)",
          }}
        />
      </div>

      {/* ── HEADER (layered over hero) ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 28px 0",
        }}
      >
        {/* Logo only — transparent asset, no box/background/border/shadow anywhere */}
        <img src={logoImg} alt="MAKc" style={{ height: "52px", objectFit: "contain", display: "block", background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", outline: "none" }} />

        {/* Enlarged ISO seal — clearly visible stamp */}
        <div
          title="ISO 9001:2015 Certified"
          style={{
            width: "68px", height: "68px", borderRadius: "50%",
            border: "2.5px solid #047857",
            background: "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(4,120,87,0.22)",
          }}
        >
          <div
            style={{
              width: "58px", height: "58px", borderRadius: "50%",
              border: "1.5px dashed #059669",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: 900, color: "#047857", letterSpacing: "0.04em" }}>
              ISO
            </span>
            <span style={{ fontSize: "8px", fontWeight: 800, color: "#047857", letterSpacing: "0.02em", marginTop: "2px" }}>
              9001:2015
            </span>
          </div>
        </div>
      </div>

      {/* ── HERO TEXT (layered over hero photo, dark text over white veil) ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          padding: "14px 28px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            width: "fit-content", marginBottom: "10px",
          }}
        >
          <span
            style={{
              display: "inline-flex", alignItems: "center",
              background: "#fef3c7",
              border: "1px solid #fde047",
              borderRadius: "4px",
              padding: "3px 10px",
              fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.18em",
              color: "#b45309", textTransform: "uppercase",
            }}
          >
            ✦ Bespoke Smart Automation Proposal
          </span>
          <span
            style={{
              display: "inline-flex", alignItems: "center",
              background: "#ffffff",
              border: "1px solid #f59e0b",
              borderRadius: "999px",
              padding: "3px 10px",
              fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.14em",
              color: "#b45309", textTransform: "uppercase",
            }}
          >
            ✦ Award Winning
          </span>
        </div>

        <h1
          style={{
            fontSize: "34px", fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.02em", margin: "0 0 8px",
            color: "#0b1526",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          }}
        >
          Smart Home Automation
          <br />
          <span style={{ color: "#0284c7", fontWeight: 900, fontStyle: "normal" }}>
            Company in Bangalore
          </span>
        </h1>

        <p
          style={{
            fontSize: "10.5px", color: "#334155", fontWeight: 500,
            maxWidth: "480px", lineHeight: 1.6, margin: "0 0 12px",
          }}
        >
          Smart homes are not about gadgets — they are about how you live. With almost a decade of
          experience and 800+ projects delivered across homes and select commercial spaces,
          here&apos;s what you can expect from us.
        </p>

        <div
          style={{
            width: "44px", height: "2px",
            background: "linear-gradient(90deg,#d4af37,#f5d97e)",
            marginBottom: "10px",
          }}
        />

        <div>
          <p
            style={{
              fontSize: "10px", color: "#334155", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 4px", fontWeight: 800,
            }}
          >
            Exclusively Prepared For
          </p>
          <p style={{ fontSize: "26px", fontWeight: 900, color: "#0b1526", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
            {clientName}
          </p>
        </div>
      </div>

      {/* ── CAPTION (tightly follows client name — no big gap) ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "8px 28px 0", flex: "0 0 auto", display: "flex", alignItems: "flex-start", paddingBottom: "10px" }}>
        <div
          style={{
            width: "100%",
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(203,213,225,0.9)",
            borderRadius: "12px",
            padding: "10px 16px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
          }}
        >
          <div>
            <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", color: "#0284c7", textTransform: "uppercase", margin: 0 }}>
              Intelligent Craftsmanship
            </p>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#0b1526", margin: "3px 0 0" }}>
              Seamless Control at Your Fingertips
            </p>
          </div>
          <span
            style={{
              fontSize: "11.5px", fontWeight: 700, color: "#0b1526",
              background: "#fef3c7",
              border: "1px solid #fde047",
              borderRadius: "6px", padding: "6px 14px", whiteSpace: "nowrap",
            }}
          >
            800+ Projects
          </span>
        </div>
      </div>

      {/* ── FOOTER WRAPPER: SERVICE PILLS + METADATA CARD (solid white, below hero) ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "6px 28px 16px", background: "#ffffff", marginTop: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", marginBottom: "10px" }}>
          {SERVICES.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px", padding: "9px 4px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "#e0f2fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: 14, height: 14, color: "#0284c7" }} />
                </div>
                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#1e293b", textAlign: "center", lineHeight: 1.2 }}>
                  {srv.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metadata Card — enlarged type for Client / Location / Ref / Prepared By */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
            {[
              { label: "Client / Project", value: clientName },
              { label: "Location", value: projectAddress },
              { label: "Quotation Ref", value: `#${quotationNo}`, color: "#0284c7" },
              { label: "Proposal Date", value: quotationDate },
            ].map((f, i) => (
              <div key={i}>
                <span
                  style={{
                    fontSize: "10.5px", color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 700,
                  }}
                >
                  {f.label}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 700, color: f.color || "#0f172a", marginTop: "2px", display: "block" }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ width: "1px", height: "54px", background: "#cbd5e1", margin: "0 18px" }} />

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: "10.5px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 700 }}>
              Prepared By
            </span>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", display: "block", marginTop: "2px" }}>
              {contactPerson}
            </span>
            <span style={{ fontSize: "12.5px", color: "#0284c7", fontWeight: 700, display: "block" }}>
              {contactPhone}
            </span>
            <span style={{ fontSize: "10.5px", color: "#64748b", display: "block", marginTop: "2px" }}>
              MAKc Automation &amp; Solutions LLP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
