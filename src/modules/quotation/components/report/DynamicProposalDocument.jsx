import React from "react";
import { MapPin, Phone, Mail, Home, Layers } from "lucide-react";
import logoImg from "@/assets/logo.png";

// ─── Section Heading Component ─────────────────────────────────────────────
function SectionHeading({ number, title, subtitle, isLight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", pageBreakAfter: "avoid", breakAfter: "avoid" }}>
      <div
        style={{
          minWidth: "24px", height: "24px", borderRadius: "7px",
          background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: 900, color: "#ffffff",
          boxShadow: "0 3px 10px rgba(14,165,233,0.4)",
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div>
        <h3 style={{ fontSize: "12px", fontWeight: 800, color: isLight ? "#0f172a" : "#f8fafc", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: "9px", color: isLight ? "#64748b" : "#94a3b8", margin: "1px 0 0", letterSpacing: "0.02em" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

const formatWarranty = (val) => {
  if (!val || val === "-" || val === "null" || val === "undefined") return "-";
  const str = String(val).trim();
  const num = parseFloat(str);
  if (!isNaN(num) && /^\d+(\.\d+)?$/.test(str)) {
    const intOrFloat = num % 1 === 0 ? num.toFixed(0) : num;
    return `${intOrFloat} ${intOrFloat === 1 ? "Yr" : "Yrs"}`;
  }
  return str;
};

// ─── Table Head Cell (category tables) ─────────────────────────────────────
// Light header row + dark navy text, matching the reference layout.
// Solid background set on each cell (not transparent) so it survives print.
function TH({ children, align = "left", width, isLight }) {
  return (
    <th
      style={{
        textAlign: align, padding: "9px 10px",
        fontSize: "10.5px", fontWeight: 800, letterSpacing: "0.02em",
        color: "#1e4a7a",
        borderBottom: "1px solid #c9dcee",
        borderRight: "1px solid #e2e8f0",
        background: "#eaf0f7",
        width: width,
        overflowWrap: "break-word",
        whiteSpace: "normal",
      }}
    >
      {children}
    </th>
  );
}

// ─── Table Data Cell ──────────────────────────────────────────────────────
function TD({ children, align = "left", style: s, isLight, rowSpan }) {
  return (
    <td
      rowSpan={rowSpan}
      style={{
        textAlign: align, padding: "8px 10px",
        fontSize: "10.5px", color: isLight ? "#1e293b" : "#e2e8f0",
        borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.05)",
        borderRight: isLight ? "1px solid #eef2f7" : undefined,
        overflowWrap: "break-word",
        ...s,
      }}
    >
      {children}
    </td>
  );
}

// ─── Main category header (ONE per application, e.g. "Smart Switches") ────
// Compact dark banner — minimal height per layout feedback.
function QuotationCategoryHeader({ title }) {
  return (
    <div
      style={{
        background: "#1e4a7a",
        color: "#ffffff",
        padding: "4px 18px",
        fontSize: "13px",
        fontWeight: 800,
        letterSpacing: "0.01em",
        lineHeight: 1.25,
        pageBreakAfter: "avoid",
        breakAfter: "avoid",
      }}
    >
      {title}
    </div>
  );
}

// ─── Floor-level subheader (ONE per floor, e.g. "Ground Floor") ────────────
// Compact floor strip — minimal height per layout feedback.
function FloorSectionHeader({ floorName, colSpan = 8 }) {
  const isGround = /ground/i.test(floorName || "");
  const Icon = isGround ? Home : Layers;
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: "2px 14px",
        fontSize: "11px",
        fontWeight: 800,
        color: "#1e4a7a",
        background: "#d7e9f7",
        borderBottom: "1px solid #bcd7ef",
        letterSpacing: "0.01em",
        lineHeight: 1.3,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
        <Icon style={{ width: 13, height: 13, color: "#1e6fb5" }} />
        {floorName}
      </span>
    </td>
  );
}

const FINISH_OPTIONS = ["", "Frame", "Frameless", "Brass", "Hybrid"];

const isSmartSwitchApp = (appName) => /switch/i.test(appName || "");

// ─── Mock QR (placeholder until the real UPI QR asset is provided) ─────────
// Deterministic pseudo-random modules + standard finder squares, inline SVG
// so it renders offline and prints reliably.
function MockQR({ size = 104 }) {
  const N = 25;
  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const cells = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y]);
    }
  }
  const finder = (ox, oy) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox} y={oy} width={7} height={7} fill="#0f172a" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#ffffff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0f172a" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} style={{ display: "block", background: "#ffffff", borderRadius: "8px" }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0f172a" />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

export default function DynamicProposalDocument({
  items,
  quotationNo,
  clientName,
  formatMoney,
  grandTotal,
  consultancyPct,
  consultancyFee,
  installationFee,
  installPct = 5,
  netTotal,
  paymentRows,
  switchFinishes = {},
  onSwitchFinishChange,
}) {
  // Group items data-driven: application -> floor -> area -> products.
  // Insertion order is preserved so floors/rooms render in quotation order.
  // Nothing is hardcoded — new rooms, floors, products or price/qty/warranty
  // changes flow through automatically.
  const appGroups = [];
  const appIndex = new Map();
  items.forEach((item, globalIdx) => {
    const appName = (item.application && item.application !== "-")
      ? item.application
      : "General";
    const floorName = (item.floor && item.floor !== "-") ? item.floor : "";
    const areaName = (item.area && item.area !== "-") ? item.area : "-";

    // Preserve original row index so Finish selections map correctly.
    const itemWithIdx = item.__idx !== undefined ? item : { ...item, __idx: globalIdx };

    let app = appIndex.get(appName);
    if (!app) {
      app = { title: appName, floors: [], floorIndex: new Map() };
      appIndex.set(appName, app);
      appGroups.push(app);
    }
    let floor = app.floorIndex.get(floorName);
    if (!floor) {
      floor = { name: floorName, areas: [], areaIndex: new Map() };
      app.floorIndex.set(floorName, floor);
      app.floors.push(floor);
    }
    let area = floor.areaIndex.get(areaName);
    if (!area) {
      area = { name: areaName, items: [] };
      floor.areaIndex.set(areaName, area);
      floor.areas.push(area);
    }
    area.items.push(itemWithIdx);
  });

  const groupEntries = appGroups;

  const isLight = true; // Light-only theme (theme switcher removed)

  const t = {
    docBg: isLight ? "#ffffff" : "#080c14",
    docText: isLight ? "#0f172a" : "#f8fafc",
    headerBg: isLight
      ? "linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)"
      : "linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(8,12,20,0) 100%)",
    headerBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
    titleText: isLight ? "#0f172a" : "#ffffff",
    badgeText: isLight ? "#b45309" : "#fbbf24",
    subtitleText: isLight ? "#0284c7" : "#38bdf8",
    refLabel: isLight ? "#64748b" : "#94a3b8",
    refNo: isLight ? "#0284c7" : "#38bdf8",
    cardBg: isLight ? "#ffffff" : "rgba(15,23,42,0.85)",
    cardBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
    cardShadow: isLight ? "0 4px 16px rgba(0,0,0,0.04)" : "0 4px 20px rgba(0,0,0,0.3)",
    tableHeadBg: isLight ? "#f8fafc" : "rgba(10,16,28,0.95)",
    groupRowBg: isLight ? "rgba(2,132,199,0.03)" : "rgba(14,165,233,0.07)",
    groupRowText: isLight ? "#1d64a6" : "#38bdf8",
    groupRowBorder: isLight ? "1.5px solid #b9d5ec" : "1.5px solid rgba(14,165,233,0.35)",
    rowZebraBg: isLight ? "#f8fafc" : "rgba(15,23,42,0.45)",
    productText: isLight ? "#0f172a" : "#f8fafc",
    notesText: isLight ? "#64748b" : "#94a3b8",
    qtyText: isLight ? "#0284c7" : "#38bdf8",
    unitPriceText: isLight ? "#334155" : "#cbd5e1",
    totalAmountText: isLight ? "#0284c7" : "#38bdf8",
    brandText: isLight ? "#0f172a" : "#f8fafc",
    warrantyText: isLight ? "#16a34a" : "#34d399",
    summaryCardBg: isLight
      ? "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
      : "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,16,28,0.95) 100%)",
    summaryCardBorder: isLight ? "1px solid #bae6fd" : "1px solid rgba(56,189,248,0.25)",
    summaryRowLabel: isLight ? "#64748b" : "#94a3b8",
    summaryRowVal: isLight ? "#0f172a" : "#f8fafc",
    summaryRowSubVal: isLight ? "#334155" : "#cbd5e1",
    summaryRowTaxVal: isLight ? "#b45309" : "#fbbf24",
    summaryRowBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.06)",
    netValLabel: isLight ? "#0f172a" : "#ffffff",
    netValText: isLight ? "#0284c7" : "#38bdf8",
    milestoneCardBg: isLight
      ? "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
      : "linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(10,16,28,0.9) 100%)",
    milestoneBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
    milestonePctText: isLight ? "#0284c7" : "#38bdf8",
    milestoneLabelText: isLight ? "#0f172a" : "#f8fafc",
    milestoneAmtText: isLight ? "#475569" : "#cbd5e1",
    warrantyBoxBg: isLight ? "#f8fafc" : "rgba(15,23,42,0.85)",
    warrantyBoxBorder: isLight ? "1px solid #a7f3d0" : "1px solid rgba(16,185,129,0.25)",
    warrantyBoxText: isLight ? "#334155" : "#cbd5e1",
    civilBoxBg: isLight ? "#f8fafc" : "rgba(15,23,42,0.85)",
    civilBoxBorder: isLight ? "1px solid #fde68a" : "1px solid rgba(245,158,11,0.25)",
    civilBoxText: isLight ? "#334155" : "#cbd5e1",
    bankCardBg: isLight
      ? "linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)"
      : "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(10,30,70,0.85) 100%)",
    bankCardBorder: isLight ? "1px solid #7dd3fc" : "1px solid rgba(56,189,248,0.35)",
    bankLabelText: isLight ? "#64748b" : "#94a3b8",
    bankValText: isLight ? "#0f172a" : "#f8fafc",
    bankMonoText: isLight ? "#0284c7" : "#38bdf8",
    signLabelText: isLight ? "#64748b" : "#94a3b8",
    signNameText: isLight ? "#0f172a" : "#f8fafc",
    signLineBorder: isLight ? "2px solid #0284c7" : "2px solid rgba(56,189,248,0.4)",
    signClientLine: isLight ? "2px solid #cbd5e1" : "2px solid rgba(148,163,184,0.35)",
    signTitleText: isLight ? "#0284c7" : "#38bdf8",
    footerBg: isLight ? "#f8fafc" : "rgba(10,16,28,0.95)",
    footerBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
    footerText: isLight ? "#64748b" : "#64748b",
  };

  return (
    <div
      className="makc-page makc-page-dynamic"
      style={{
        background: t.docBg,
        color: t.docText,
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── HEADER ─── */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 36px 14px",
          borderBottom: t.headerBorder,
          // background: t.headerBg,
        }}
      >
        <div>
          <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.22em", color: t.badgeText, textTransform: "uppercase", margin: 0, marginBottom: "3px" }}>
            ✦ Commercial Proposal &amp; Schedule
          </p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: t.titleText }}>
            Scope of Work
          </h2>
          <p style={{ fontSize: "10px", color: t.subtitleText, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "3px 0 0" }}>
            Itemized Scope · Pricing · Milestones
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "8px", color: t.refLabel, display: "block", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Proposal Ref</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: t.refNo, fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>#{quotationNo}</span>
          </div>
          {/* Logo only — transparent asset, no box/background/border/shadow anywhere */}
          <img src={logoImg} alt="MAKc" style={{ height: "52px", objectFit: "contain", display: "block", background: "transparent", backgroundColor: "transparent", border: "none", boxShadow: "none", outline: "none" }} />
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ padding: "20px 36px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* ── SECTION 1: Itemized Scope Schedule ── */}
        <div>
          <SectionHeading
            number="01"
            title="Itemized Scope Schedule"
            subtitle={`${items.length} products configured across property zones with specifications, pricing & warranty`}
            isLight={isLight}
          />

          {/* ── One category card per application (e.g. Smart Switches, Door Automation).
              Each card: ONE dark category header → column headers → ONE floor
              subheader per floor → continuous rows with Area/Room as a column.
              Rooms with multiple products use rowspan so the room name
              appears once per group. ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {groupEntries.map((group, gi) => {
              const isSwitchGroup = isSmartSwitchApp(group.title);
              const appTotal = group.floors
                .flatMap((f) => f.areas)
                .flatMap((a) => a.items)
                .reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
              return (
                <div
                  key={gi}
                  style={{
                    border: t.cardBorder,
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: t.cardBg,
                    boxShadow: t.cardShadow,
                  }}
                >
                  {/* MAIN category header — rendered once per application */}
                  <QuotationCategoryHeader title={group.title} />

                  {/* Fluid table — fills the section width with wrapping text,
                    so no per-section scrollbar is needed on any screen size */}
                  <div>
                    <table className="makc-proposal-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                      <thead style={{ background: "#eaf0f7" }}>
                        <tr>
                          <TH width={isSwitchGroup ? "13%" : "15%"} isLight={isLight}>Area / Room</TH>
                          <TH width={isSwitchGroup ? "24%" : "28%"} isLight={isLight}>Product / System Specification</TH>
                          <TH align="center" width={isSwitchGroup ? "6%" : "7%"} isLight={isLight}>Qty</TH>
                          <TH align="right" width={isSwitchGroup ? "11%" : "13%"} isLight={isLight}>Unit Price</TH>
                          <TH align="right" width={isSwitchGroup ? "11%" : "13%"} isLight={isLight}>Total Price</TH>
                          {/* Finish column — Smart Switches table ONLY */}
                          {isSwitchGroup && (
                            <TH align="center" width="11%" isLight={isLight}>Finish</TH>
                          )}
                          <TH align="left" width="12%" isLight={isLight}>Brand</TH>
                          <TH align="center" width="12%" isLight={isLight}>Warranty</TH>
                        </tr>
                      </thead>
                      <tbody>
                        {group.floors.map((floor, fi) => (
                          <React.Fragment key={fi}>
                            {/* FLOOR subheader — rendered once per floor */}
                            {floor.name !== "" && (
                              <tr style={{ background: "#d7e9f7" }} className="break-inside-avoid">
                                <FloorSectionHeader floorName={floor.name} colSpan={isSwitchGroup ? 8 : 7} />
                              </tr>
                            )}
                            {floor.areas.map((area, ai) => (
                              <React.Fragment key={ai}>
                                {area.items.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className="break-inside-avoid"
                                    style={{
                                      background: idx % 2 === 0 ? "transparent" : t.rowZebraBg,
                                    }}
                                  >
                                    {/* AREA/ROOM column — room name rendered once per
                                      area group via rowspan; subsequent product
                                      rows of the same room omit this cell */}
                                    {idx === 0 && (
                                      <TD
                                        isLight={isLight}
                                        rowSpan={area.items.length > 1 ? area.items.length : undefined}
                                        style={{
                                          fontWeight: 700,
                                          color: t.productText,
                                          fontSize: "11px",
                                          verticalAlign: "top",
                                          background: "#ffffff",
                                        }}
                                      >
                                        {area.name}
                                      </TD>
                                    )}
                                    <TD isLight={isLight} style={{ fontWeight: 500, color: t.productText, fontSize: "11px" }}>
                                      {item.product}
                                      {item.notes && item.notes !== `${item.floor} - ${item.area}` && (
                                        <div style={{ fontSize: "8.5px", color: t.notesText, marginTop: "2px", fontWeight: 400 }}>
                                          {item.notes}
                                        </div>
                                      )}
                                    </TD>
                                    <TD isLight={isLight} align="center" style={{ fontWeight: 800, color: t.qtyText, fontSize: "11.5px" }}>
                                      {item.quantity}
                                    </TD>
                                    <TD isLight={isLight} align="right" style={{ color: t.unitPriceText, fontSize: "11px", fontWeight: 500 }}>
                                      {formatMoney(item.price)}
                                    </TD>
                                    <TD isLight={isLight} align="right" style={{ fontWeight: 800, color: t.totalAmountText, fontSize: "11.5px" }}>
                                      {formatMoney(item.totalPrice)}
                                    </TD>
                                    {/* Finish cell — Smart Switches rows ONLY, no column otherwise */}
                                    {isSwitchGroup && (
                                      <TD isLight={isLight} align="center" style={{ fontWeight: 600, color: t.brandText, fontSize: "10.5px" }}>
                                        <select
                                          className="quotation-no-print"
                                          value={switchFinishes[item.__idx] || ""}
                                          onChange={(e) => onSwitchFinishChange && onSwitchFinishChange(item.__idx, e.target.value)}
                                          style={{
                                            fontSize: "10px", fontWeight: 600, color: "#0f172a",
                                            border: "1px solid #cbd5e1", borderRadius: "6px",
                                            padding: "2px 4px", background: "#f8fafc", maxWidth: "100%",
                                          }}
                                        >
                                          {FINISH_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt === "" ? "Select" : opt}</option>
                                          ))}
                                        </select>
                                        <span
                                          style={{ display: "none" }}
                                          className="makc-print-only"
                                        >
                                          {switchFinishes[item.__idx] || "-"}
                                        </span>
                                        <style>{`@media print { .quotation-no-print { display: none !important; } .makc-print-only { display: inline !important; } } @media screen { .makc-print-only { display: none !important; } }`}</style>
                                      </TD>
                                    )}
                                    <TD isLight={isLight} align="left" style={{ fontWeight: 700, color: t.brandText, fontSize: "11px" }}>
                                      {item.brand || "-"}
                                    </TD>
                                    <TD isLight={isLight} align="center" style={{ fontWeight: 700, color: t.warrantyText, fontSize: "11px" }}>
                                      {formatWarranty(item.warranty)}
                                    </TD>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Per-service total — shown for every application */}
                  <div
                    className="break-inside-avoid"
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 18px",
                      background: "#f1f5f9",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#1e4a7a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Total {group.title}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 900, color: "#0284c7" }}>
                      {formatMoney(appTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Summary Card (full width) */}
          <div style={{ marginTop: "14px" }}>
            <div
              className="break-inside-avoid"
              style={{
                width: "100%",
                background: t.summaryCardBg,
                border: t.summaryCardBorder,
                borderRadius: "12px",
                padding: "14px 18px",
                boxShadow: t.summaryCardShadow,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                {[
                  { label: "Grand Total", value: formatMoney(grandTotal), color: t.summaryRowVal },
                  { label: "Consultancy & Design", value: formatMoney(consultancyFee), color: t.summaryRowSubVal },
                  { label: "Installation", value: formatMoney(installationFee), color: t.summaryRowSubVal },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontSize: "10px",
                      padding: "10px 12px",
                      border: t.summaryRowBorder,
                      borderRadius: "8px",
                    }}
                  >
                    <span style={{ color: t.summaryRowLabel }}>{row.label}</span>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12px",
                  marginTop: "12px",
                  borderTop: t.summaryRowBorder,
                }}
              >
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 800,
                    color: t.netValLabel,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Net Project Value
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: t.netValText,
                    letterSpacing: "-0.01em",
                    textShadow: isLight ? "none" : "0 0 12px rgba(56,189,248,0.3)",
                  }}
                >
                  {formatMoney(netTotal)}
                </span>
              </div>
              <p style={{ fontSize: "8px", color: t.notesText, margin: "6px 0 0", textAlign: "right" }}>
                All prices inclusive of applicable taxes, product, delivery and installation.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Payment Milestones ── */}
        <div>
          <SectionHeading number="02" title="Payment Milestones" subtitle="Structured payment schedule for seamless project execution" isLight={isLight} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {paymentRows.map((pay, i) => (
              <div
                key={i}
                className="break-inside-avoid"
                style={{
                  background: t.milestoneCardBg,
                  border: t.milestoneBorder,
                  borderRadius: "12px", padding: "12px 10px",
                  textAlign: "center",
                  boxShadow: t.cardShadow,
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 900, color: t.milestonePctText, lineHeight: 1 }}>{pay.percentage}</div>
                <div style={{ fontSize: "9.5px", fontWeight: 800, color: t.milestoneLabelText, margin: "5px 0 3px" }}>{pay.label}</div>
                <div style={{ fontSize: "11.5px", fontWeight: 700, color: t.milestoneAmtText }}>{formatMoney(pay.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Bank Details ── */}
        <div>
          <SectionHeading number="03" title="Bank Transfer Details" subtitle="NEFT / RTGS / IMPS payment information" isLight={isLight} />

          <div
            className="break-inside-avoid"
            style={{
              background: t.bankCardBg,
              border: t.bankCardBorder,
              borderRadius: "12px", padding: "14px 18px",
              display: "flex", alignItems: "center", gap: "20px",
              boxShadow: t.cardShadow,
            }}
          >
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px" }}>
              {[
                { label: "Account Name", value: "MAKc Automation and Solutions LLP", mono: false },
                { label: "Bank Name", value: "ICICI Bank", mono: false },
                { label: "Account Number", value: "777705435168", mono: true },
                { label: "IFSC Code", value: "ICIC0000561", mono: true },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "8px", color: t.bankLabelText, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2px" }}>
                    {f.label}
                  </span>
                  <span
                    style={{
                      fontSize: f.mono ? "12px" : "10.5px",
                      fontWeight: 800,
                      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                      color: f.mono ? t.bankMonoText : t.bankValText,
                      letterSpacing: f.mono ? "0.06em" : 0,
                    }}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
            {/* Mock UPI QR — swap MockQR with the real QR image when provided */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "6px" }}>
                <MockQR size={104} />
              </div>
              <span style={{ fontSize: "8.5px", fontWeight: 800, color: t.bankValText, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Scan to Pay · UPI
              </span>
            </div>
          </div>
        </div>

        {/* ── Signature Block ── */}
        <div
          className="break-inside-avoid"
          style={{
            paddingTop: "28px",
            paddingBottom: "12px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px",
          }}
        >
          {/* Company Authorised */}
          <div>
            <p style={{ fontSize: "8.5px", color: t.signLabelText, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 600 }}>
              Prepared &amp; Authorised By
            </p>
            <p style={{ fontSize: "11.5px", fontWeight: 800, color: t.signNameText, margin: "0 0 32px" }}>
              MAKc Automation and Solutions LLP
            </p>
            <div style={{ borderBottom: t.signLineBorder, width: "170px" }} />
            <p style={{ fontSize: "8.5px", color: t.signTitleText, marginTop: "4px", fontWeight: 600 }}>
              Authorized Signatory
            </p>
          </div>

          {/* Client Acceptance */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "8.5px", color: t.signLabelText, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 600 }}>
              Client Acceptance Signature
            </p>
            <p style={{ fontSize: "11.5px", fontWeight: 800, color: t.signNameText, margin: "0 0 32px" }}>{clientName}</p>
            <div style={{ borderBottom: t.signClientLine, width: "170px", marginLeft: "auto" }} />
            <p style={{ fontSize: "8.5px", color: t.signLabelText, marginTop: "4px", fontWeight: 500 }}>
              Signature &amp; Date
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

