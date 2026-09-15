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

// Light-only executive cover (theme switcher removed).
// Text always sits on solid white — the photo lives inside its own framed
// card with a controlled caption scrim, so no full-page overlay is needed.
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
      {/* Subtle decorative glow (solid, never fights text) */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "120px", zIndex: 0,
          background: "radial-gradient(60% 100% at 50% 0%, rgba(2,132,199,0.07) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── HEADER ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 28px 0",
        }}
      >
        <div
          style={{
            background: "#fff", borderRadius: "10px",
            padding: "5px 12px",
          
          
          }}
        >
          <img src={logoImg} alt="MAKc" style={{ height: "30px", objectFit: "contain", display: "block" }} />
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "999px",
            padding: "4px 12px",
            fontSize: "8.5px", fontWeight: 700, color: "#047857",
            letterSpacing: "0.04em",
          }}
        >
          <ShieldCheck style={{ width: 11, height: 11, color: "#059669" }} />
          ISO 9001:2015 Certified
        </div>
      </div>

      {/* ── HERO TEXT (on solid white — always crisp) ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          padding: "14px 28px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex", alignItems: "center",
            background: "#fef3c7",
            border: "1px solid #fde047",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: "7.5px", fontWeight: 800, letterSpacing: "0.18em",
            color: "#b45309", textTransform: "uppercase",
            width: "fit-content", marginBottom: "10px",
          }}
        >
          ✦ Bespoke Smart Automation Proposal
        </div>

        <h1
          style={{
            fontSize: "34px", fontWeight: 900, lineHeight: 1.08,
            letterSpacing: "-0.02em", margin: "0 0 8px",
            color: "#0b1526",
          }}
        >
          Smart Home Automation
          <br />
          <span className="italic" style={{ color: "#0284c7", fontWeight: 900 }}>
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
              fontSize: "8px", color: "#64748b", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 2px", fontWeight: 700,
            }}
          >
            Exclusively Prepared For
          </p>
          <p style={{ fontSize: "17px", fontWeight: 900, color: "#0b1526", margin: 0, letterSpacing: "-0.01em" }}>
            {clientName}
          </p>
        </div>
      </div>

      {/* ── FRAMED PHOTO CARD (flexes to fill spare space, scrim lives only inside, under caption) ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "12px 28px 0", flex: "1 1 auto", display: "flex", minHeight: "60mm" }}>
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: "60mm",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #cbd5e1",
            boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
          }}
        >
          <img
            src={bgImage}
            alt="Smart home"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Caption scrim — only the bottom of the photo */}
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: "46%",
              background: "linear-gradient(to top, rgba(8,15,28,0.88) 0%, rgba(8,15,28,0) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute", left: "18px", right: "18px", bottom: "14px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            }}
          >
            <div>
              <p style={{ fontSize: "8px", fontWeight: 800, letterSpacing: "0.16em", color: "#7dd3fc", textTransform: "uppercase", margin: 0 }}>
                Intelligent Craftsmanship
              </p>
              <p style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", margin: "3px 0 0" }}>
                Seamless Control at Your Fingertips
              </p>
            </div>
            <span
              style={{
                fontSize: "8.5px", fontWeight: 700, color: "#ffffff",
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: "6px", padding: "4px 10px", whiteSpace: "nowrap",
              }}
            >
              800+ Projects
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER WRAPPER: SERVICE PILLS + METADATA CARD ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "12px 28px 16px" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
          {SERVICES.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px", padding: "6px 3px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "4px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, borderRadius: 5,
                    background: "#e0f2fe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: 11, height: 11, color: "#0284c7" }} />
                </div>
                <span style={{ fontSize: "8px", fontWeight: 600, color: "#1e293b", textAlign: "center", lineHeight: 1.2 }}>
                  {srv.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metadata Card */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 24px" }}>
            {[
              { label: "Client / Project", value: clientName },
              { label: "Location", value: projectAddress },
              { label: "Quotation Ref", value: `#${quotationNo}`, color: "#0284c7" },
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
                <span style={{ fontSize: "10px", fontWeight: 700, color: f.color || "#0f172a", marginTop: "1px", display: "block" }}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ width: "1px", height: "38px", background: "#cbd5e1", margin: "0 16px" }} />

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: "7.5px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 600 }}>
              Prepared By
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", display: "block", marginTop: "1px" }}>
              {contactPerson}
            </span>
            <span style={{ fontSize: "9.5px", color: "#0284c7", fontWeight: 600, display: "block" }}>
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
