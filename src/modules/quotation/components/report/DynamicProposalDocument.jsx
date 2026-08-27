import React from "react";
import { Building2, MapPin, Phone, Mail, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
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

// ─── Table Head Cell ───────────────────────────────────────────────────────
function TH({ children, align = "left", width, isLight }) {
  return (
    <th
      style={{
        textAlign: align, padding: "7px 10px",
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
        color: isLight ? "#475569" : "#94a3b8", textTransform: "uppercase",
        borderBottom: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)",
        width: width,
      }}
    >
      {children}
    </th>
  );
}

// ─── Table Data Cell ──────────────────────────────────────────────────────
function TD({ children, align = "left", style: s, isLight }) {
  return (
    <td
      style={{
        textAlign: align, padding: "7px 10px",
        fontSize: "10.5px", color: isLight ? "#1e293b" : "#e2e8f0",
        borderBottom: isLight ? "1px solid #f1f5f9" : "1px solid rgba(255,255,255,0.05)",
        ...s,
      }}
    >
      {children}
    </td>
  );
}

export default function DynamicProposalDocument({
  items,
  quotationNo,
  clientName,
  formatMoney,
  grandTotal,
  installationFee,
  gstTax,
  netTotal,
  paymentRows,
  pdfTheme = "dark",
}) {
  // Group items by application (service category)
  const groups = {};
  items.forEach((item) => {
    const key = item.application;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const groupEntries = Object.entries(groups);

  const isLight = pdfTheme === "light";

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
    cardBg: isLight ? "#f8fafc" : "rgba(15,23,42,0.85)",
    cardBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.08)",
    cardShadow: isLight ? "0 4px 16px rgba(0,0,0,0.04)" : "0 4px 20px rgba(0,0,0,0.3)",
    tableHeadBg: isLight ? "#f1f5f9" : "rgba(10,16,28,0.95)",
    groupRowBg: isLight
      ? "linear-gradient(90deg, rgba(14,165,233,0.1) 0%, rgba(248,250,252,0.6) 100%)"
      : "linear-gradient(90deg, rgba(14,165,233,0.12) 0%, rgba(15,23,42,0.4) 100%)",
    groupRowText: isLight ? "#0284c7" : "#38bdf8",
    groupRowBorder: isLight ? "1px solid #bae6fd" : "1px solid rgba(14,165,233,0.25)",
    rowZebraBg: isLight ? "#f8fafc" : "rgba(15,23,42,0.45)",
    productText: isLight ? "#0f172a" : "#f8fafc",
    notesText: isLight ? "#64748b" : "#94a3b8",
    tagBg: isLight ? "#f1f5f9" : "rgba(30,41,59,0.8)",
    tagBorder: isLight ? "1px solid #cbd5e1" : "1px solid rgba(148,163,184,0.2)",
    tagText: isLight ? "#0369a1" : "#a5f3fc",
    qtyText: isLight ? "#0284c7" : "#38bdf8",
    brandText: isLight ? "#334155" : "#cbd5e1",
    warrantyBg: isLight ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.12)",
    warrantyBorder: isLight ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(16,185,129,0.3)",
    warrantyText: isLight ? "#059669" : "#34d399",
    unitPriceText: isLight ? "#475569" : "#cbd5e1",
    totalAmountText: isLight ? "#0284c7" : "#7dd3fc",
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
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
          background: t.headerBg,
        }}
      >
        <div>
          <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.22em", color: t.badgeText, textTransform: "uppercase", margin: 0, marginBottom: "3px" }}>
            ✦ Commercial Proposal &amp; Schedule
          </p>
          <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em", color: t.titleText }}>
            Scope of Work &amp; Investment
          </h2>
          <p style={{ fontSize: "10px", color: t.subtitleText, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "3px 0 0" }}>
            Itemized Scope · Pricing · Milestones · Governance
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "8px", color: t.refLabel, display: "block", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Proposal Ref</span>
            <span style={{ fontSize: "13px", fontWeight: 800, color: t.refNo, fontFamily: "monospace" }}>#{quotationNo}</span>
          </div>
          <div style={{ background: "#ffffff", borderRadius: "10px", padding: "5px 12px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", border: isLight ? "1px solid #e2e8f0" : "none" }}>
            <img src={logoImg} alt="MAKc" style={{ height: "26px", objectFit: "contain", display: "block" }} />
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ padding: "20px 36px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* ── SECTION 1: Scope of Work ── */}
        <div>
          <SectionHeading number="01" title="Itemized Scope of Work" subtitle={`${items.length} products configured across property zones`} isLight={isLight} />

          <div
            style={{
              border: t.cardBorder,
              borderRadius: "12px", overflow: "hidden",
              background: t.cardBg,
              boxShadow: t.cardShadow,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: t.tableHeadBg }}>
                <tr>
                  <TH width="32px" isLight={isLight}>#</TH>
                  <TH isLight={isLight}>Product / System Specification</TH>
                  <TH isLight={isLight}>Application &amp; Location</TH>
                  <TH align="center" width="42px" isLight={isLight}>Qty</TH>
                  <TH isLight={isLight}>Brand</TH>
                  <TH isLight={isLight}>Warranty</TH>
                </tr>
              </thead>
              <tbody>
                {groupEntries.map(([appName, appItems], gi) => (
                  <React.Fragment key={gi}>
                    {/* Group header row */}
                    <tr style={{ background: t.groupRowBg }} className="break-inside-avoid">
                      <td
                        colSpan={6}
                        style={{
                          padding: "6px 10px",
                          fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em",
                          color: t.groupRowText, textTransform: "uppercase",
                          borderBottom: t.groupRowBorder,
                        }}
                      >
                        ▸ {appName}
                      </td>
                    </tr>
                    {appItems.map((item, idx) => {
                      const globalIdx = items.indexOf(item) + 1;
                      return (
                        <tr key={idx} className="break-inside-avoid" style={{ background: idx % 2 === 0 ? "transparent" : t.rowZebraBg }}>
                          <TD isLight={isLight} style={{ color: t.refLabel, fontFamily: "monospace", fontSize: "9.5px", fontWeight: 600 }}>{globalIdx}</TD>
                          <TD isLight={isLight}>
                            <div style={{ fontWeight: 700, color: t.productText, fontSize: "10.5px" }}>{item.product}</div>
                            {item.notes && <div style={{ fontSize: "8.5px", color: t.notesText, marginTop: "2px" }}>{item.notes}</div>}
                          </TD>
                          <TD isLight={isLight}>
                            <span
                              style={{
                                display: "inline-block",
                                background: t.tagBg, border: t.tagBorder,
                                borderRadius: "5px", padding: "2px 7px",
                                fontSize: "8.5px", fontWeight: 600, color: t.tagText,
                              }}
                            >
                              {item.floor} · {item.area}
                            </span>
                          </TD>
                          <TD isLight={isLight} align="center" style={{ fontWeight: 900, color: t.qtyText, fontSize: "11px" }}>{item.quantity}</TD>
                          <TD isLight={isLight} style={{ color: t.brandText, fontSize: "10px", fontWeight: 500 }}>{item.brand}</TD>
                          <TD isLight={isLight}>
                            <span
                              style={{
                                display: "inline-block",
                                background: t.warrantyBg, border: t.warrantyBorder,
                                borderRadius: "4px", padding: "1px 6px",
                                color: t.warrantyText, fontWeight: 700, fontSize: "9px",
                              }}
                            >
                              {item.warranty}
                            </span>
                          </TD>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 2: Commercial Pricing & Totals Card ── */}
        <div>
          <SectionHeading number="02" title="Commercial Investment Breakdown" subtitle="Unit pricing, quantities & total investment per product" isLight={isLight} />

          <div style={{ display: "grid", gridTemplateColumns: items.length <= 4 ? "1fr 290px" : "1fr", gap: "14px", alignItems: "start" }}>
            {/* Table */}
            <div
              style={{
                border: t.cardBorder,
                borderRadius: "12px", overflow: "hidden",
                background: t.cardBg,
                boxShadow: t.cardShadow,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: t.tableHeadBg }}>
                  <tr>
                    <TH isLight={isLight}>Item Description</TH>
                    <TH align="center" width="45px" isLight={isLight}>Qty</TH>
                    <TH align="right" isLight={isLight}>Unit Price</TH>
                    <TH align="right" isLight={isLight}>Total Amount</TH>
                  </tr>
                </thead>
                <tbody>
                  {groupEntries.map(([appName, appItems], gi) => {
                    const groupSum = appItems.reduce((s, x) => s + x.totalPrice, 0);
                    return (
                      <React.Fragment key={gi}>
                        <tr style={{ background: t.groupRowBg }} className="break-inside-avoid">
                          <td
                            colSpan={4}
                            style={{
                              padding: "6px 10px",
                              fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em",
                              color: t.groupRowText, textTransform: "uppercase",
                              borderBottom: t.groupRowBorder,
                            }}
                          >
                            ▸ {appName}
                          </td>
                        </tr>
                        {appItems.map((item, idx) => (
                          <tr key={idx} className="break-inside-avoid" style={{ background: idx % 2 === 0 ? "transparent" : t.rowZebraBg }}>
                            <TD isLight={isLight} style={{ fontWeight: 600, color: t.productText }}>{item.product}</TD>
                            <TD isLight={isLight} align="center" style={{ fontWeight: 800, color: t.qtyText, fontSize: "11px" }}>{item.quantity}</TD>
                            <TD isLight={isLight} align="right" style={{ color: t.unitPriceText }}>{formatMoney(item.price)}</TD>
                            <TD isLight={isLight} align="right" style={{ fontWeight: 800, color: t.totalAmountText }}>{formatMoney(item.totalPrice)}</TD>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Card */}
            <div
              className="break-inside-avoid"
              style={{
                background: t.summaryCardBg,
                border: t.summaryCardBorder,
                borderRadius: "12px", padding: "14px 16px",
                boxShadow: t.summaryCardShadow,
              }}
            >
              {[
                { label: "Hardware Subtotal", value: formatMoney(grandTotal), color: t.summaryRowVal },
                { label: "Transportation & Installation (5%)", value: formatMoney(installationFee), color: t.summaryRowSubVal },
                { label: "GST @ 18%", value: formatMoney(gstTax), color: t.summaryRowTaxVal },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "10px", padding: "5px 0",
                    borderBottom: t.summaryRowBorder,
                  }}
                >
                  <span style={{ color: t.summaryRowLabel }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: "10px", marginTop: "6px",
                }}
              >
                <span style={{ fontSize: "10.5px", fontWeight: 800, color: t.netValLabel, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Net Project Value
                </span>
                <span
                  style={{
                    fontSize: "18px", fontWeight: 900, color: t.netValText,
                    letterSpacing: "-0.01em", textShadow: isLight ? "none" : "0 0 12px rgba(56,189,248,0.3)",
                  }}
                >
                  {formatMoney(netTotal)}
                </span>
              </div>
              <p style={{ fontSize: "8px", color: t.notesText, margin: "6px 0 0", textAlign: "right" }}>
                All prices inclusive of product, delivery &amp; installation.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Payment Milestones ── */}
        <div>
          <SectionHeading number="03" title="Payment Milestones" subtitle="Structured payment schedule for seamless project execution" isLight={isLight} />

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

        {/* ── SECTION 4: Warranty & Terms ── */}
        <div>
          <SectionHeading number="04" title="Warranty Coverage & Governance" subtitle="Comprehensive protection and project scope" isLight={isLight} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div
              className="break-inside-avoid"
              style={{
                background: t.warrantyBoxBg,
                border: t.warrantyBoxBorder,
                borderRadius: "10px", padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <ShieldCheck style={{ width: 14, height: 14, color: isLight ? "#059669" : "#34d399" }} />
                <p style={{ fontSize: "9.5px", fontWeight: 800, color: isLight ? "#059669" : "#34d399", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Standard Warranty Coverage
                </p>
              </div>
              {[
                "Smart Touch Switches: 5-Year Replacement",
                "Curtain Motors & Tracks: 5-Year Motor",
                "Smart Lights & Drivers: 2-Year Full",
                "Sensors & Gate Automation: 2-Year",
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <CheckCircle2 style={{ width: 10, height: 10, color: isLight ? "#059669" : "#34d399", flexShrink: 0 }} />
                  <span style={{ fontSize: "9px", color: t.warrantyBoxText, fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>

            <div
              className="break-inside-avoid"
              style={{
                background: t.civilBoxBg,
                border: t.civilBoxBorder,
                borderRadius: "10px", padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <AlertTriangle style={{ width: 14, height: 14, color: isLight ? "#d97706" : "#fbbf24" }} />
                <p style={{ fontSize: "9.5px", fontWeight: 800, color: isLight ? "#d97706" : "#fbbf24", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Civil Scope & Exclusions
                </p>
              </div>
              <p style={{ fontSize: "9px", color: t.civilBoxText, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                All civil work, back-box wiring, and conduit routing to be completed by customer's
                contractor before deployment. Main power distribution lines, third-party routers,
                and external internet services are outside MAKc scope.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Bank Details ── */}
        <div>
          <SectionHeading number="05" title="Bank Transfer Details" subtitle="NEFT / RTGS / IMPS payment information" isLight={isLight} />

          <div
            className="break-inside-avoid"
            style={{
              background: t.bankCardBg,
              border: t.bankCardBorder,
              borderRadius: "12px", padding: "14px 18px",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 28px",
              boxShadow: t.cardShadow,
            }}
          >
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
                    fontFamily: f.mono ? "monospace" : "inherit",
                    color: f.mono ? t.bankMonoText : t.bankValText,
                    letterSpacing: f.mono ? "0.06em" : 0,
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Signature Block ── */}
        <div
          className="break-inside-avoid"
          style={{
            paddingTop: "16px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px",
          }}
        >
          {/* Company Authorised */}
          <div>
            <p style={{ fontSize: "8.5px", color: t.signLabelText, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 600 }}>
              Prepared &amp; Authorised By
            </p>
            <p style={{ fontSize: "11.5px", fontWeight: 800, color: t.signNameText, margin: "0 0 18px" }}>
              MAKc Automation and Solutions LLP
            </p>
            <div style={{ borderBottom: t.signLineBorder, width: "170px" }} />
            <p style={{ fontSize: "8.5px", color: t.signTitleText, marginTop: "4px", fontStyle: "italic", fontWeight: 600 }}>
              Authorized Signatory
            </p>
          </div>

          {/* Client Acceptance */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "8.5px", color: t.signLabelText, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", fontWeight: 600 }}>
              Client Acceptance Signature
            </p>
            <p style={{ fontSize: "11.5px", fontWeight: 800, color: t.signNameText, margin: "0 0 18px" }}>{clientName}</p>
            <div style={{ borderBottom: t.signClientLine, width: "170px", marginLeft: "auto" }} />
            <p style={{ fontSize: "8.5px", color: t.signLabelText, marginTop: "4px", fontWeight: 500 }}>
              Signature &amp; Date
            </p>
          </div>
        </div>

      </div>

      {/* ─── FOOTER ─── */}
      <div
        style={{
          padding: "12px 36px",
          borderTop: t.footerBorder,
          background: t.footerBg,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", gap: "20px", fontSize: "9px", color: t.footerText }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin style={{ width: 10, height: 10, color: isLight ? "#0284c7" : "#38bdf8" }} />
            BEML Layout, Brookfield, Bangalore – 560066
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone style={{ width: 10, height: 10, color: isLight ? "#0284c7" : "#38bdf8" }} />
            +91-7338504441
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Mail style={{ width: 10, height: 10, color: isLight ? "#0284c7" : "#38bdf8" }} />
            vinod@makcautomations.com
          </span>
        </div>
        <span style={{ fontSize: "9px", color: isLight ? "#b45309" : "#fbbf24", fontWeight: 700, letterSpacing: "0.05em" }}>
          Commercial Proposal — Confidential
        </span>
      </div>
    </div>
  );
}

