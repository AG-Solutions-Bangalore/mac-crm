import React from "react";
import { Sliders, Layers, Lock, Wifi, Video, Volume2, Lightbulb } from "lucide-react";
import logoImg from "@/assets/MAKc-Logo.svg";
import isoImg from "@/assets/iso.png";
import heroBgImg from "@/assets/hero_bg-light-1392.webp";

const SERVICES = [
  { title: "Smart Switches", icon: Sliders },
  { title: "Curtains & Blinds", icon: Layers },
  { title: "Door & Gate Automation", icon: Lock },
  { title: "Networking", icon: Wifi },
  { title: "CCTV & Security", icon: Video },
  { title: "Room Audio", icon: Volume2 },
  { title: "Lights", icon: Lightbulb },
];

const PAGE_PX = "28px";

// Shared font — ui-sans-serif on every text in this page
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Light executive cover — hero photo extends across the top (~72% height)
// with a smooth top-to-bottom overlay so the image shows through properly
// while maintaining crisp text readability and dissolving into solid white at the bottom.
export default function CoverPage({
  clientName,
  clientPhone,
  propertyType,
  projectAddress,
  quotationNo,
  quotationDate,
  contactPerson,
  contactPhone,
  bgImage = heroBgImg,
}) {
  return (
    <div
      className="makc-page makc-cover-page"
      style={{
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
        padding: 0,
        width: "100%",
        maxWidth: "210mm",
        height: "296mm",
        maxHeight: "296mm",
        pageBreakInside: "avoid",
        breakInside: "avoid",
        pageBreakAfter: "always",
        breakAfter: "page",
        border: "1px solid rgba(0, 0, 0, 0.1)",

      }}
    >
      {/* Enforce ui-sans-serif on every text in this page */}
      <style>{`.makc-cover-page, .makc-cover-page * { font-family: ${FONT} !important; }`}</style>
      {/* ── HERO BACKGROUND — villa photo with smooth top-to-bottom overlay ── */}
      <div
        style={{
          position: "absolute", top: "-10%", left: 0, right: 0, width: "100%", height: "100%", zIndex: 0,
          overflow: "hidden", pointerEvents: "none",
        }}
      >
        <img
          src={bgImage || heroBgImg}
          alt="Smart home"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
        />
        {/* Reverse overlay: white at top for crisp text legibility, fading to transparent toward bottom so bg image shows properly */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, #ffffff 17%, rgba(255,255,255,0.92) 24%, rgba(255,255,255,0.20) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>

      {/* ── HEADER (transparent — full-bleed photo behind logos) ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: "20px", paddingLeft: PAGE_PX, paddingRight: PAGE_PX, paddingBottom: "4px",
          boxSizing: "border-box", width: "100%",
          background: "transparent",
        }}
      >
        {/* MAKc Brand Logo — logo only, no white box/background */}
        <img
          src={logoImg}
          alt="MAKc"
          style={{
            height: "48px", width: "auto", objectFit: "contain", display: "block",
            background: "transparent", backgroundColor: "transparent",
            border: "none", boxShadow: "none", outline: "none", padding: 0,
          }}
        />

        {/* Official ISO 9001:2015 SVG Stamp — no white box/background */}
        <img
          src={isoImg}
          alt="ISO 9001:2015"
          style={{
            height: "58px", width: "auto", objectFit: "contain", display: "block",
            background: "transparent", backgroundColor: "transparent",
            border: "none", boxShadow: "none", outline: "none", padding: 0,
          }}
        />
      </div>

      {/* ── HERO TEXT (dark text over white veil, photo full-bleed behind) ── */}
      <div
        style={{
          position: "relative", zIndex: 2,
          paddingTop: "14px", paddingLeft: PAGE_PX, paddingRight: PAGE_PX, paddingBottom: 0,
          boxSizing: "border-box", width: "100%",
          background: "transparent",
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
            fontFamily: FONT,
          }}
        >
          Smart Home Automation
          <br />
          <span style={{ color: "#0369a1", fontWeight: 900, fontStyle: "normal", fontFamily: FONT }}>
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
              fontSize: "11px", color: "#1e293b", letterSpacing: "0.14em",
              textTransform: "uppercase", margin: "0 0 5px", fontWeight: 800,
            }}
          >
            Exclusively Prepared For
          </p>
          <p style={{ fontSize: "32px", fontWeight: 900, color: "#0b1526", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
            {clientName}
          </p>
        </div>
      </div>

      {/* ── CAPTION (tightly follows client name — no big gap) ── */}
      <div style={{ position: "relative", zIndex: 2, paddingTop: "2px", paddingLeft: PAGE_PX, paddingRight: PAGE_PX, paddingBottom: "10px", boxSizing: "border-box", width: "100%", flex: "0 0 auto", display: "flex", alignItems: "flex-start", background: "transparent" }}>
        <div
          className="makc-caption-card"
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
            className="bg-amber-200"
            style={{
              fontSize: "11.5px", fontWeight: 700, color: "#0b1526",
              // background: "#fef3c7",
              border: "1px solid #fde047",
              borderRadius: "6px", padding: "6px 14px", whiteSpace: "nowrap",
            }}
          >
            800+ Projects Completed
          </span>
        </div>
      </div>

      {/* ── FOOTER WRAPPER: SERVICE PILLS + METADATA CARD (solid white, below hero) ── */}
      <div style={{ position: "relative", zIndex: 2, paddingTop: "6px", paddingLeft: PAGE_PX, paddingRight: PAGE_PX, paddingBottom: "16px", boxSizing: "border-box", width: "100%", background: "#ffffff", marginTop: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "10px" }}>
          {SERVICES.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px", padding: "9px 3px",
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
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#1e293b", textAlign: "center", lineHeight: 1.2 }}>
                  {srv.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Metadata Card — Client / Client Contact / Property Type / Ref / Date / Prepared By */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            padding: "14px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 18px", flex: 1 }}>
            {[
              { label: "Client", value: clientName },
              { label: "Client Contact", value: clientPhone || "-" },
              { label: "Property Type", value: propertyType || projectAddress || "-" },
              { label: "Quotation Ref", value: `#${quotationNo}`, color: "#0284c7" },
              { label: "Proposal Date", value: quotationDate },
            ].map((f, i) => (
              <div key={i}>
                <span
                  style={{
                    fontSize: "10px", color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontWeight: 700,
                  }}
                >
                  {f.label}
                </span>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: f.color || "#0f172a", marginTop: "2px", display: "block", overflowWrap: "break-word" }}>
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
