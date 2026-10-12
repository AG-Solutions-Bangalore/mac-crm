# Quotation updates ✅ = Complete | 🟡 = Pending

---

# ENGLISH VERSION (for sharing)

## Completed ✅ (verified in code)

1. **Add Quotation form** — Buyer search + inline Add New Buyer (auto-select); product dropdown explains empty state (e.g. Frame products live under Smart Switches); category products always listed, row Service auto-corrects on select with auto rate; edit mode has Save Changes (overwrite) + Save as New (new quote with today's date).
2. **Cover page** — Transparent logo (no white box); darker "Exclusively Prepared For"; client name 32px; tight gap to caption; 7 service pills (Room Audio + Lights separate, Door & Gate Automation, 800+ Projects Completed); Client / Client Contact / Property Type / Ref / Date / Prepared By (4 persons).
3. **Scope & Pricing** — Per-service totals + Grand Total; Consultancy & Design % and Installation % (5/7/10/15 presets or custom, no % printed, values only); Finish column for Smart Switches only; wider Brand column; Net Project Value + Payment Milestones (30/60/10) + Bank/UPI + sign blocks.
4. **Company Profile** — Room Audio + CCTV & Security, "Why choose MAKc?", Service Excellence (no SLA wording), Awards.
5. **Validity Date** — `quotation_validity_date` (Required, default Empty) in Create/Edit Basic Details + Validity Date column in list + Expired / Expiring-in-Xd / Valid badges on quotation + project lists.
6. **Convert to Project** — Actions-menu button + summary confirm dialog → `POST /project` (full quote + line items copied) + quotation status → `"Project"` + toast + refetch.
7. **Projects module** — `/project-list` + create/edit pages, sidebar item, status filter, `price_validity_date` field, full line-item tree + quick-adds, unsaved-changes guard, 3-dot actions.
8. **Unsaved-changes popup** — shadcn `AlertDialog` (Stay / Leave without saving / Save & Leave) on Quotation, Rev + Project forms; Back/Cancel/sidebar/browser-back covered; refresh/tab-close = browser native (OS restriction); dialog-clickable fix via `data-unsaved-dialog`.
9. **Save stays in working file** — Edit stays + refetch; Create jumps to the new record's edit page (`replace:true`). No more list redirect mid-work.
10. **Product dropdown freshness** — `products-for-quotation` invalidated on product create/update; quick-add auto-ticks category; row-service fallback; Refresh Products button on all 3 forms.
11. **Table breathing room** — Sidebar 18.75rem → 13.5rem; layout padding `p-4/md:p-6` → `p-1/md:p-2`; list `px-5` → `px-1`; Actions → 3-dot dropdown; table wrapper scrolls (`block overflow-x-auto`) + `whitespace-nowrap` headers/date cells.
12. **Status filter** — Quotation list `All Status / Pending / Approved / Project / Cancel` (+ `&status=` API param with client fallback).

## Backend Dependency 🔌 — which pending task needs backend, and why

- **Convert to Project:** DELIVERED ✅ — `"Project"` status accepted, `/project` CRUD APIs live, convert flow working end-to-end.
- **Projects list / validity:** DELIVERED ✅ — project list + `price_validity_date` + expiry badges working.
- **Estimates-only view:** needs server-side "hide converted" filter (converted quotes still show in quotation list) — else client-side hide.
- **Closed Projects:** need `"Closed"` status or payment-done flag in DB. Without backend: page can't exist.
- **Follow-up reminders:** quotation has no follow-up date/frequency field; Notification module is broadcast-only (no auto-due engine). Without backend: reminders can't save or trigger.
- **Project Notifications (Extend/Paid/Close):** due-calculation + notify trigger + extend/snooze APIs are backend work. Without backend: page can't fetch alerts or persist actions.
- **Inline quick-add (Floor/Area/Brand/Product):** backend READY ✅ — create APIs exist. Built without backend changes.

## HINDI VERSION (neeche original)

## Backend Dependency 🔌 — kaun sa pending task backend par kyu depend hai

- Sec 5 Convert to Project: DELIVERED ✅ — `"Project"` status accept hota hai, `/project` APIs live, flow kaam kar raha hai.
- Sec 6 Estimates-only view: converted hide ke liye server-side filter chahiye (converted quotes abhi list me dikhte hai).
- Sec 6 Closed: `"Closed"` status ya payment-done flag DB me nahi. Bina backend: page ban nahi sakta.
- Sec 6 Follow-up: quotation me follow-up date/frequency field nahi; Notification module sirf broadcast hai (auto-due engine nahi). Bina backend: reminder save/trigger nahi hoga.
- Sec 8 Notifications (Extend/Paid/Close): due-calc + notify trigger + extend/snooze APIs backend kaam. Bina backend: alerts/persist nahi.
- Sec 7 Quick-add (Floor/Area/Brand/Product): backend READY ✅ — create APIs hain. Bina backend-change ban gaya.

## 8. Validity + Project Notifications 🟡 In Progress

- [Pending] Backend: hardware/final payment flags, due-notification trigger
- [Complete ✅] Estimate form (Create & Edit) + Quotation List me `quotation_validity_date` field & column added
- [Complete ✅] Convert dialog as clean confirmation modal (Buyer, Property, Amount details + 1-click status convert)
- [Complete ✅] Projects/Quotation list me validity badge/warning (Expired, Expiring in Xd, Valid)
- [Pending] Project Notifications page (Operations → Projects ke neeche): expiring/stagnant list + Extend (1 month/custom) / Client Paid → X din baad yaad dilao / Close actions

## 6. Sidebar flow (Operations) 🟡 Partially pending

- [Complete ✅] Backend delivered `"Project"` status + `/project` APIs; Projects page (`/project-list`) + sidebar item live
- [Complete ✅] Quotation list me Status filter dropdown (All Status, Pending, Approved, Project, Cancel) + API `&status=` query param (client fallback ke saath)
- [Pending] Estimates = sirf non-converted (rename + converted hide — converted quotes abhi quotation list me dikhte hai)
- [Pending] Closed Projects page (final payment done wale — `"Closed"` status / payment-done flag backend chahiye)
- [Pending] Follow-up: quote me reminder frequency (5/7/10/14/custom), notification par snooze ya next date (follow-up fields + due-engine backend chahiye)
- [Pending/Decision] Complaint sidebar me abhi visible hai — hide karna hai ya nahi, decision chahiye (route intact rahega)

## 7. Quote me inline quick-add ✅

## Pending 🟡 (verified — code me ye nahi mile)

5. **Estimates-only view** — converted (`"Project"`) quotes quotation list me abhi bhi dikhte hai; rename + hide baaki (server-side filter ya client-side decision).
6. **Closed Projects page** — `"Closed"` status / payment-done flag backend chahiye.
7. **Follow-up engine** — dashboard par sirf mock data; real follow-up fields + snooze + due-engine baaki (Notification module broadcast-only).
8. **Project Notifications page** — expiring/stagnant list + Extend / Paid-remind / Close actions (backend trigger + APIs chahiye).
9. **Complaint sidebar decision** — abhi visible hai; hide karna hai ya nahi (route intact).

---

- Floor/Area: row dropdown footer "+ Add" (sirf naam wala dialog, auto-select, list auto-refresh)
- Brand: product dialog me Brand label ke paas hamesha-dikhne wala "+ New Brand" button + dropdown footer (inline add, auto-select)
- Product: "+ Add Product" footer → dialog master-mirror (koi field required nahi, sirf price-if-present check — bilkul create page jaisa) → row me auto-select + rate fill
- Service: row dropdown me search + "+ Add Service" → dialog master-mirror (naam + logo + sub-banner required, same messages/payload) → service tick + row me auto-select
- Buyer dialog master-mirror (Buyer Name / Mobile Number / Email Address messages exact)
- Dropdown width fix: Service/Floor/Area selects chaude, Area `md:w-2/3`; menu min-width 240px (narrow control par bhi); Add button text truncate (bahar bleed nahi hoga)
- Product dropdown fallback: match zero ho to category products dikhenge + select par row Service auto-correct
- Product quick-add Rate-0 fix: select par fresh product object se price (stale list bypass) — Rate/Amount turant sahi

## 5. Convert Estimate to Project ✅ Done (code-verified)

- [Complete ✅] Backend & Frontend: `"Project"` status accepted; `/project` CRUD APIs live; status options, filters, badges me `"Project"` everywhere
- [Complete ✅] Actions me Convert to Project button (3-dot menu) + summary confirm dialog (Buyer/Property/Amount + Validity Date) + `POST /project` (full quote + line items copy) + status update + toast + refetch
- [Complete ✅] Naya Projects module (`/project-list` + create/edit) + sidebar item + `price_validity_date` field
- [Pending] Converted quotes estimates list se hide (converted abhi quotation list me dikhte hai — rename/filter decision baaki)

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
- Quotation + Revised + Project forms teeno me integrated (`QuotationFormPage.jsx`, `RevQuotationFormPage.jsx`, `ProjectFormPage.jsx`): pristine snapshot vs current form se `isDirty`; Back/Cancel buttons `requestNavigate` se; sidebar/header `<Link>` clicks capture-phase me roke jate hai; browser Back ke liye dummy history entry + `popstate` guard.
- Refresh / tab-close par sirf browser ka native prompt aata hai (browsers waha custom/shadcn UI allow nahi karte — OS-level restriction).
- Clickable fix: guard ka document-level capture listener dialog open hone par dialog ke andar ke clicks bhi block kar raha tha (buttons unclickable lag rahe the) — `data-unsaved-dialog` attribute se dialog-inside clicks ko allow kiya, background clicks ab bhi blocked.

## 10. Save working file me hi hota hai (list par redirect nahi) ✅

- `QuotationFormPage`: Save dabane par list par nahi jata — Edit me yahi rehta hai (+ refetch, toast), Create me naye quotation ke edit page par `replace:true` se jata hai (working file me hi raho).
- `RevQuotationFormPage`: same — Create me nayi revision ke edit page par, Edit me yahi + `refetch()`.
- `ProjectFormPage`: same pattern — Edit stays, Create naye project ke edit page par.
- `saveWithoutNavigate` success par id/`true` return karta hai (dialog ke Save & Leave ke liye); `handleSaveAsNew` snapshot clear karke naye edit par le jata hai.

## 11. Product dropdown — naya product turant dikhega ✅

- Root cause: `useCreateProductMutation` / `useUpdateProductMutation` sirf `["products"]` invalidate karte the, `["products-for-quotation"]` (5-min stale) stale reh jata tha — master se add kiya product dropdown me nahi aata tha. Ab dono jagah `products-for-quotation` bhi invalidate hota hai (`src/modules/product/hooks/useProduct.js`).
- Quick-add (`saveProductQA`) ab naye product ki category bhi auto-tick karta hai (pehle sirf service tick hota tha, category filter se product gayab lagta tha).
- Row options fallback strong kiya (`getRowProductOptions`): pehle checked-list me row-service match, phir all-services list me row-service match (stale-list bypass — master me abhi add hua product bhi dikhe), phir category fallback + just-created items.
- Rev form me koi fallback nahi tha (strict filter) — `getRevRowProductOptions` add kiya + price lookup combined list (`productsList + catProductsList`) se.
- Quotation + Revised + Project forms me **Refresh Products** button (`RefreshCw`): `products-for-quotation` invalidate + refetch + toast — master me product add karke page chhode bina list refresh karo. (Project form me bhi same button hai.)
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

### 4. Dedicated Projects Module (CRUD & APIs) ✅
- **APIs & Hooks Integrated (`src/modules/project/`):**
  - `GET /project` (with pagination, search, status filter)
  - `POST /project` (create project)
  - `GET /project/{id}` (fetch project details by id)
  - `PUT /project/{id}` (update project)
  - `DELETE /project-sub/{id}` (delete project sub line item)
  - `PATCH /projects/{id}/status` (status toggle)
- **Project List Page (`ProjectListPage.jsx`):**
  - Integrated `DataTable` with status filter (`All Status`, `Project`, `Pending`, `Approved`, `Cancel`), search, pagination.
  - Price Validity Date column with real-time expiry badges (🔴 Expired, 🟡 Expiring Soon, 🟢 Valid).
  - Actions dropdown: Edit Project (`/project-list/edit/:id`), View Report (`/quotation-report/:id`).
  - Add Project button (`/project-list/create`).
- **Project Form Page (`ProjectFormPage.jsx`):**
  - Includes extra `price_validity_date` field along with all quotation fields.
  - Dual-mapping for project and quotation fields ensuring bulletproof API compatibility.
  - Full hierarchical line items (Services ➔ Floors ➔ Areas ➔ Products).
  - Quick-add inline master dialogs for Buyer, Floor, Area, Brand, Product, and Service.
  - Unsaved-changes protection via pure shadcn dialog (`useUnsavedChangesGuard`).
  - Delete line item connects to `DELETE /project-sub/{id}`.
  - Excluded finish work date API and revisions per backend spec.
- **Convert to Project Bridge:**
  - "Convert to Project" in `QuotationListPage.jsx` now pulls full quotation details and line items, sends them to `POST /project` to create a real record in the Project module, and updates quotation status to `"Project"`.
- **Edit Auto-Fill & Select Hardening:**
  - Hardened `select-with-add.jsx` against string/number type mismatches (`String(opt.value) === String(v)`) with label preservation.
  - Hardened `groupSubsToServices` in `ProjectFormPage.jsx` with fallbacks for all key variants (`project_sub_*`, `quotation_sub_*`, `sub_*`, and plain keys) and preserved pre-assigned names (`serviceName`, `floorName`, `areaName`, `productName`).
  - Hardened service, floor, area, and product option lookups so options are never dropped or blank even before master lists load.

---

## All Pending — with context (English)

> Code-verified just now: every item below was grepped in `src` and genuinely not found. Everything else claimed ✅ above was also re-verified.

### P1. Estimates-only view (converted hide + rename) 🟡 — needs decision (+ optional backend filter)
- **Context:** Converted quotes (`quotation_status === "Project"`) still appear in the Quotation list — only the Convert menu item hides for them (`QuotationListPage.jsx:333`). Sidebar still says "Quotations", not "Estimates".
- **Frontend scope:** rename "Quotations" → "Estimates" (or keep both) + hide/filter converted rows (client-side one-liner, or `&status=` server filter).
- **User impact:** estimates and projects look mixed today.

### P2. Closed Projects Page 🟡 — blocked on backend
- **Context:** Operations will eventually need a separate section for finalized/closed projects. No `"Closed"` status or payment-done flag exists in code/DB.
- **Blocked by:** Backend implementing `"Closed"` status or `is_payment_completed` flag in DB.

### P3. Follow-up reminders with snooze / next date 🟡 — blocked on backend
- **Context:** Only mock data exists (`home.jsx` "Mock" badges). Quotations have no follow-up date/frequency field, and the Notification module (`/notification-list`) is broadcast-only (no auto-due engine), so reminders can't be saved or triggered.
- **Frontend scope:** Reminder frequency on the quote (5/7/10/14/custom); snooze or next-date action on the notification.
- **Blocked by:** Follow-up date/frequency fields + automated due-notification scheduler on the backend.
- **User impact if built without backend:** Reminders won't save or trigger.

### P4. Project Notifications Page (Stagnant/Expiring Projects) 🟡 — blocked on backend
- **Context:** Visual expiry badges are live on both Quotation and Project lists, but there is no centralized Operations dashboard for expiring/stagnant projects with quick actions.
- **Frontend scope:** Project Notifications page (Operations → under Projects) listing stagnant/expiring projects with quick actions: Extend (1 month / custom), Client Paid (remind after X days), and Close Project.
- **Blocked by:** Backend due-calculation logic, notification triggers, and extend/snooze APIs.
- **User impact if built without backend:** Page cannot fetch automated stagnant alerts or persist extension webhooks.

### P5. Complaint sidebar visibility — needs decision 🟡
- **Context:** Complaint is currently visible in the sidebar for all roles (screenshot + `app-sidebar.jsx` confirmed). This file earlier claimed it hidden — that was incorrect, now fixed.
- **Scope:** One-line hide (route intact) if desired, else close as won't-do.
