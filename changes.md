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

## HINDI VERSION (neeche original)

## Backend Dependency 🔌 — kaun sa pending task backend par kyu depend hai

- Sec 5 Convert to Project: `PATCH /quotations/{id}/status` aaj sirf Pending/Cancel/Approved leta hai — `"Project"` value accept hogi ya nahi unknown; `/projects` API hai hi nahi (404). Bina backend: button error dega, move/hide nahi hoga.
- Sec 6 Estimates/Projects/Closed: naye status + server-side list filter chahiye; Closed ke liye payment-done flag DB me hai hi nahi. Bina backend: pages khaali/galat data.
- Sec 6 Follow-up: quotation me follow-up date/frequency field nahi; Notification module sirf broadcast hai (auto-due engine nahi). Bina backend: reminder save/trigger nahi hoga.
- Sec 8 Validity + Notifications: estimate_valid_till / price_validity_date / payment flags fields nahi; due-calc + notify trigger backend kaam. Bina backend: dates save nahi, expiry alerts nahi.
- Sec 7 Quick-add (Floor/Area/Brand/Product): backend READY ✅ — create APIs hain, naam required. Bina backend-change ban sakta hai.

## 8. Validity + Project Notifications 🟡 In Progress

- [Pending] Backend: hardware/final payment flags, due-notification trigger
- [Complete ✅] Estimate form (Create & Edit) + Quotation List me `quotation_validity_date` field & column added
- [Complete ✅] Convert dialog as clean confirmation modal (Buyer, Property, Amount details + 1-click status convert)
- [Complete ✅] Projects/Quotation list me validity badge/warning (Expired, Expiring in Xd, Valid)
- [Pending] Project Notifications page (Operations → Projects ke neeche): expiring/stagnant list + Extend (1 month/custom) / Client Paid → X din baad yaad dilao / Close actions

## 6. Sidebar flow (Operations) 🟡 Pending

- [Pending] Backend: `"Project"` + `"Closed"` status, follow-up date/frequency, payment-done flag — backend chahiye
- [Complete ✅] Quotation list me Status filter dropdown (All Status, Pending, Approved, Cancel) + API `&status=` query param added
- [Pending] Estimates = sirf non-converted (rename + converted hide)
- [Pending] Actions me Convert to Project button → Projects me move
- [Pending] Closed Projects page (final payment done wale)
- [Pending] Follow-up: quote me reminder frequency (5/7/10/14/custom), notification par snooze ya next date
- [pending] Complaint sidebar se hide (route intact — decision: sirf hide)

## 7. Quote me inline quick-add ✅

## Pending 🟡

5. **Convert Estimate to Project** — backend status/API, Actions button, hide from estimates, Projects page.
6. **Sidebar flow** — Estimates (non-converted only), Projects, Closed Projects, Follow-up with snooze/date.
7. **Inline quick-add in quote** — Floor/Area/Brand (+ Add footer), Product quick-add dialog.
8. **Validity + Project Notifications** — Valid Till on estimate, Price Validity on convert, expiry notifications with Extend / Paid-remind / Close.

---

- Floor/Area: row dropdown footer "+ Add" (sirf naam wala dialog, auto-select, list auto-refresh)
- Brand: product dialog me Brand label ke paas hamesha-dikhne wala "+ New Brand" button + dropdown footer (inline add, auto-select)
- Product: "+ Add Product" footer → dialog master-mirror (koi field required nahi, sirf price-if-present check — bilkul create page jaisa) → row me auto-select + rate fill
- Service: row dropdown me search + "+ Add Service" → dialog master-mirror (naam + logo + sub-banner required, same messages/payload) → service tick + row me auto-select
- Buyer dialog master-mirror (Buyer Name / Mobile Number / Email Address messages exact)
- Dropdown width fix: Service/Floor/Area selects chaude, Area `md:w-2/3`; menu min-width 240px (narrow control par bhi); Add button text truncate (bahar bleed nahi hoga)
- Product dropdown fallback: match zero ho to category products dikhenge + select par row Service auto-correct
- Product quick-add Rate-0 fix: select par fresh product object se price (stale list bypass) — Rate/Amount turant sahi

## 5. Convert Estimate to Project 🟡 In Progress

- [Complete ✅] Backend & Frontend: `"Project"` status added to status options, filters, and list badges
- [Complete ✅] Actions me Convert to Project button + confirm dialog (with Validity Date) + toast
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

#

--------------------------------------New changes--------------------------------

## 9. Unsaved-changes popup (shadcn, no native) ✅

- Naya reusable guard: `src/hooks/useUnsavedChangesGuard.js` + `src/components/common/unsaved-changes-dialog.jsx` (pure shadcn `AlertDialog` — Stay / Leave without saving / Save & Leave, no `confirm()`/`alert()`).
- Quotation + Revised quotation form dono me integrated (`QuotationFormPage.jsx`, `RevQuotationFormPage.jsx`): pristine snapshot vs current form se `isDirty`; Back/Cancel buttons `requestNavigate` se; sidebar/header `<Link>` clicks capture-phase me roke jate hai; browser Back ke liye dummy history entry + `popstate` guard.
- Refresh / tab-close par sirf browser ka native prompt aata hai (browsers waha custom/shadcn UI allow nahi karte — OS-level restriction).
- Clickable fix: guard ka document-level capture listener dialog open hone par dialog ke andar ke clicks bhi block kar raha tha (buttons unclickable lag rahe the) — `data-unsaved-dialog` attribute se dialog-inside clicks ko allow kiya, background clicks ab bhi blocked.

## 10. Save working file me hi hota hai (list par redirect nahi) ✅

- `QuotationFormPage`: Save dabane par list par nahi jata — Edit me yahi rehta hai (+ refetch, toast), Create me naye quotation ke edit page par `replace:true` se jata hai (working file me hi raho).
- `RevQuotationFormPage`: same — Create me nayi revision ke edit page par, Edit me yahi + `refetch()`.
- `saveWithoutNavigate` success par id/`true` return karta hai (dialog ke Save & Leave ke liye); `handleSaveAsNew` snapshot clear karke naye edit par le jata hai.

## 11. Product dropdown — naya product turant dikhega ✅

- Root cause: `useCreateProductMutation` / `useUpdateProductMutation` sirf `["products"]` invalidate karte the, `["products-for-quotation"]` (5-min stale) stale reh jata tha — master se add kiya product dropdown me nahi aata tha. Ab dono jagah `products-for-quotation` bhi invalidate hota hai (`src/modules/product/hooks/useProduct.js`).
- Quick-add (`saveProductQA`) ab naye product ki category bhi auto-tick karta hai (pehle sirf service tick hota tha, category filter se product gayab lagta tha).
- Row options fallback strong kiya (`getRowProductOptions`): pehle checked-list me row-service match, phir all-services list me row-service match (stale-list bypass — master me abhi add hua product bhi dikhe), phir category fallback + just-created items.
- Rev form me koi fallback nahi tha (strict filter) — `getRevRowProductOptions` add kiya + price lookup combined list (`productsList + catProductsList`) se.
- Dono forms ke Quotation Items header me **Refresh Products** button (`RefreshCw`): `products-for-quotation` invalidate + refetch + toast — master me product add karke page chhode bina list refresh karo.
- Note: dropdown ab bhi top Categories/Services checkboxes se filter hota hai — naye product ki category tick honi chahiye, nahi to hint batayega (kis service me products hai).

---

## Recent Completed Work ✅ (English)

### 1. Validity Date & Dynamic Expiry Badges
- **Form Integration:** `quotation_validity_date` added to Quotation Create and Edit forms in Basic Details; integrated into form state, pristine snapshots, `isDirty` tracking, and save payloads.
- **List Column:** Added "Validity Date" column in `QuotationListPage`.
- **Dynamic Badges:** Real-time visual status badges:
  - 🔴 **Expired** (past date)
  - 🟡 **Expiring Soon** (`Expiring today` or `Expiring in Xd` if within 7 days)
  - 🟢 **Valid** (safe date)

### 2. Status Filter & "Project" Status Support
- **Status Filter:** Added Status filter dropdown on Quotation List (`All Status`, `Pending`, `Approved`, `Project`, `Cancel`) with API query parameter integration (`&status=`) and instant client-side fallback filtering.
- **"Project" Status:** Backend enabled `"Project"` status. Added `"Project"` option in form status dropdowns and dedicated badges (`pill-in_progress`) on list tables (`QuotationListPage`, `RevQuotationListPage`).

### 3. Convert Estimate to Project Flow
- **Actions Menu:** Added **"Convert to Project"** button in Quotation List for non-project quotes.
- **Confirmation Modal:** Clean confirmation dialog displaying quotation summary (Buyer, Property, Amount) without redundant inputs.
- **Instant Save & Auto-Close:** Converts status to `"Project"` via API, immediately closes modal, triggers success toast, and refetches the list.

---

## All Pending — with context (English)

> Updated status following completion of Convert dialog, Status filter, "Project" status, and Validity dates.

### P1. Dedicated Projects Page & Sidebar Flow 🟡 — ready for frontend
- **Context:** Operations needs separate pages/buckets for active Projects vs initial Estimates. Now that `"Project"` status is active and filterable, a dedicated Projects page can be built.
- **Frontend scope:**
  - Create dedicated Projects page (`/project-list`) displaying quotations where `quotation_status === "Project"`.
  - Add "Projects" link under Operations in the sidebar (`app-sidebar.jsx`).
  - Optionally hide converted `"Project"` records from default Estimates view (or rely on the existing status filter).
  - Hide "Complaint" from sidebar (`app-sidebar.jsx`) while keeping route intact.
- **Backend dependency for Closed Projects:** Closed Projects page remains blocked until backend implements `"Closed"` status or `is_payment_completed` flag in DB.

### P2. Follow-up reminders with snooze / next date 🟡 — blocked on backend
- **Context:** Quotations have no follow-up date/frequency field, and the Notification module is broadcast-only (no auto-due engine), so reminders can't be saved or triggered.
- **Frontend scope:** Reminder frequency on the quote (5/7/10/14/custom); snooze or next-date action on the notification.
- **Blocked by:** Follow-up date/frequency fields + automated due-notification scheduler on the backend.
- **User impact if built without backend:** Reminders won't save or trigger.

### P3. Project Notifications Page (Stagnant/Expiring Projects) 🟡 — blocked on backend
- **Context:** While visual expiry badges are now active on the list page, a centralized Operations dashboard for expiring/stagnant projects with quick actions is needed.
- **Frontend scope:** Project Notifications page (Operations → under Projects) listing stagnant/expiring projects with quick actions: Extend (1 month / custom), Client Paid (remind after X days), and Close Project.
- **Blocked by:** Backend due-calculation logic, notification triggers, and extend/snooze APIs.
- **User impact if built without backend:** Page cannot fetch automated stagnant alerts or persist extension webhooks.
