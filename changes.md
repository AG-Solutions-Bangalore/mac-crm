# Quotation updates ✅ = Complete | 🟡 = Pending

---

# ENGLISH VERSION (for sharing)

## Completed ✅

1. **Add Quotation form** — Buyer search + inline Add New Buyer (auto-select); product dropdown explains empty state (e.g. Frame products live under Smart Switches); category products always listed, row Service auto-corrects on select with auto rate; edit mode has Save Changes (overwrite) + Save as New (new quote with today's date).
2. **Cover page** — Transparent logo (no white box); darker "Exclusively Prepared For"; client name 32px; tight gap to caption; 7 service pills (Room Audio + Lights separate, Door & Gate Automation, 800+ Projects Completed); Client / Client Contact / Property Type / Ref / Date / Prepared By (4 persons).
3. **Scope & Pricing** — Per-service totals + Grand Total; Consultancy & Design % and Installation % (5/7/10/15 presets or custom, no % printed, values only); Finish column for Smart Switches only; wider Brand column; Net Project Value + Payment Milestones (30/60/10) + Bank/UPI + sign blocks.
4. **Company Profile** — Room Audio + CCTV & Security, "Why choose MAKc?", Service Excellence (no SLA wording), Awards.
5. **Sidebar** — Complaint hidden (route kept).

## Backend Dependency 🔌 — which pending task needs backend, and why

- **Convert to Project:** status API accepts only Pending/Cancel/Approved today — unknown if `"Project"` is accepted; no `/projects` API (404). Without backend: button errors, no move/hide.
- **Estimates / Projects / Closed Projects:** need new statuses + server-side list filter; no payment-done flag exists in DB. Without backend: pages show wrong/empty data.
- **Follow-up reminders:** quotation has no follow-up date/frequency field; Notification module is broadcast-only (no auto-due engine). Without backend: reminders can't save or trigger.
- **Validity + Project Notifications:** no estimate_valid_till / price_validity_date / payment flags; due-calculation + notify trigger is backend work. Without backend: dates won't save, no expiry alerts.
- **Inline quick-add (Floor/Area/Brand/Product):** backend READY ✅ — create APIs exist. Can be built without backend changes.

## Pending 🟡

5. **Convert Estimate to Project** — backend status/API, Actions button, hide from estimates, Projects page.
6. **Sidebar flow** — Estimates (non-converted only), Projects, Closed Projects, Follow-up with snooze/date.
7. **Inline quick-add in quote** — Floor/Area/Brand (+ Add footer), Product quick-add dialog.
8. **Validity + Project Notifications** — Valid Till on estimate, Price Validity on convert, expiry notifications with Extend / Paid-remind / Close.

---

## HINDI VERSION (neeche original)

## Backend Dependency 🔌 — kaun sa pending task backend par kyu depend hai

- Sec 5 Convert to Project: `PATCH /quotations/{id}/status` aaj sirf Pending/Cancel/Approved leta hai — `"Project"` value accept hogi ya nahi unknown; `/projects` API hai hi nahi (404). Bina backend: button error dega, move/hide nahi hoga.
- Sec 6 Estimates/Projects/Closed: naye status + server-side list filter chahiye; Closed ke liye payment-done flag DB me hai hi nahi. Bina backend: pages khaali/galat data.
- Sec 6 Follow-up: quotation me follow-up date/frequency field nahi; Notification module sirf broadcast hai (auto-due engine nahi). Bina backend: reminder save/trigger nahi hoga.
- Sec 8 Validity + Notifications: estimate_valid_till / price_validity_date / payment flags fields nahi; due-calc + notify trigger backend kaam. Bina backend: dates save nahi, expiry alerts nahi.
- Sec 7 Quick-add (Floor/Area/Brand/Product): backend READY ✅ — create APIs hain, naam required. Bina backend-change ban sakta hai.

## 8. Validity + Project Notifications 🟡 Pending

- [Pending] Backend: estimate_valid_till, price_validity_date, hardware/final payment flags, due-notification trigger — backend chahiye
- [Pending] Estimate form me Valid Till date field
- [Pending] Convert dialog me Price Validity date picker (manual date)
- [Pending] Project Notifications page (Operations → Projects ke neeche): expiring/stagnant list + Extend (1 month/custom) / Client Paid → X din baad yaad dilao / Close actions
- [Pending] Projects list me validity badge/warning (expiring highlight)

## 6. Sidebar flow (Operations) 🟡 Pending

- [Pending] Backend: `"Project"` + `"Closed"` status, follow-up date/frequency, payment-done flag — backend chahiye
- [Pending] Estimates = sirf non-converted (rename + converted hide)
- [Pending] Actions me Convert to Project button → Projects me move
- [Pending] Closed Projects page (final payment done wale)
- [Pending] Follow-up: quote me reminder frequency (5/7/10/14/custom), notification par snooze ya next date
- [pending] Complaint sidebar se hide (route intact — decision: sirf hide)

## 7. Quote me inline quick-add ✅

- Floor/Area: row dropdown footer "+ Add" (sirf naam wala dialog, auto-select, list auto-refresh)
- Brand: product dialog me Brand label ke paas hamesha-dikhne wala "+ New Brand" button + dropdown footer (inline add, auto-select)
- Product: "+ Add Product" footer → dialog master-mirror (koi field required nahi, sirf price-if-present check — bilkul create page jaisa) → row me auto-select + rate fill
- Service: row dropdown me search + "+ Add Service" → dialog master-mirror (naam + logo + sub-banner required, same messages/payload) → service tick + row me auto-select
- Buyer dialog master-mirror (Buyer Name / Mobile Number / Email Address messages exact)
- Dropdown width fix: Service/Floor/Area selects chaude, Area `md:w-2/3`; menu min-width 240px (narrow control par bhi); Add button text truncate (bahar bleed nahi hoga)
- Product dropdown fallback: match zero ho to category products dikhenge + select par row Service auto-correct
- Product quick-add Rate-0 fix: select par fresh product object se price (stale list bypass) — Rate/Amount turant sahi

## 5. Convert Estimate to Project 🟡 Pending

- [Pending] Backend: `PATCH /quotations/{id}/status` me `"Project"` status accept ho (ya convert API) — backend confirm chahiye
- [Pending] Actions me Convert to Project button + confirm + toast
- [Pending] Converted quotes estimates list se hide
- [Pending] Naya Projects page (`/project-list`) + sidebar item

## 1. Add Quotation form ✅

- Buyer me search + Add New Buyer option — form chhode bina naya buyer banao, auto-select ho jayega
- Product dropdown khaali ho to ab wajah batayega (e.g. Frame products Smart Switches me hai — wahi tick karo)
- Category me product hai to dropdown me dikhega, select karte hi row ka Service khud sahi ho jayega + rate auto-bharega
- Edit me Save Changes (overwrite) + Save as New (aaj ki date me naya quote)

## 2. Quotation PDF — Page 1 (Cover) ✅

- Logo white box hataya, sirf logo
- "Exclusively Prepared For" dark & clear, Client name bada (32px), neeche gap kam
- Service pills: Room Audio + Lights alag-alag, Door & Gate Automation, 800+ Projects Completed
- Client, Client Contact, Property Type, Ref, Date + Prepared By (4 persons dropdown)

## 3. Quotation PDF — Scope/Pricing ✅

- Har service ka alag total (Smart Switches total, Networking total...) + Grand Total
- Consultancy & Design % aur Installation % — 5/7/10/15 ya koi bhi custom %, PDF me % number nahi dikhega, sirf value
- Finish column (Frame/Frameless/Brass) sirf Smart Switches me, Total Price–Brand ke beech
- Brand column chauda — lambe naam (Grandstream) ek line me
- Net Project Value + Payment Milestones (30/60/10) + Bank/UPI + sign blocks

## 4. Company Profile page ✅

- Room Audio + CCTV & Security included, "Why choose MAKc?", Service Excellence (SLA word hataya), Awards
