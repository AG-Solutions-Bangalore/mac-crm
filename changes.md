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

- [Pending] Backend: status/project conversion, hardware/final payment flags, due-notification trigger
- [Complete ✅] Estimate form (Create & Edit) + Quotation List me `quotation_validity_date` field & column added
- [Pending] Convert dialog me Price Validity date picker (manual date)
- [Pending] Project Notifications page (Operations → Projects ke neeche): expiring/stagnant list + Extend (1 month/custom) / Client Paid → X din baad yaad dilao / Close actions
- [Pending] Projects list me validity badge/warning (expiring highlight)

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

## All Pending — with context (English)

> Source: items marked 🟡 / `[Pending]` above (Sec 5, 6, 8). Recent work (Sec 9, 10, 11) is complete — build passes. Sec 7 inline quick-add is marked ✅, so it is excluded.

### P1. Convert Estimate to Project 🟡 — blocked on backend
- **Context:** There is no way today to move a won estimate into execution. The status API (`PATCH /quotations/{id}/status`) only accepts `Pending/Cancel/Approved`, and there is no `/projects` API (returns 404).
- **Frontend scope:** Actions-column "Convert to Project" button + confirm + toast; hide converted quotes from the estimates list; new Projects page (`/project-list`) + sidebar item.
- **Blocked by:** backend must accept `"Project"` status (or expose a convert API) and confirm the projects listing contract.
- **User impact if built without backend:** button errors, nothing moves/hides.

### P2. Sidebar flow — Estimates / Projects / Closed Projects 🟡 — blocked on backend
- **Context:** Operations needs three clean buckets: Estimates (only non-converted), Projects (converted/in-progress), Closed Projects (final payment done). Today there are no `"Project"`/`"Closed"` statuses, no payment-done flag in DB, and no server-side list filter.
- **Frontend scope:** rename/filter Estimates to non-converted only; Projects page; Closed Projects page (final-payment-done only).
- **Blocked by:** new statuses + payment-done flag + server-side filtering.
- **User impact if built without backend:** pages show wrong/empty data.
- **Note — conflict in this file:** Sec 5 (line 13) says "Complaint hidden (route kept)" as Completed, but Sec 6 still lists "Complaint hide" as pending. Needs a decision: hide-only (frontend, no backend) vs something more.

### P3. Follow-up reminders with snooze / next date 🟡 — blocked on backend
- **Context:** Quotations have no follow-up date/frequency field, and the Notification module is broadcast-only (no auto-due engine), so reminders can't be saved or triggered.
- **Frontend scope:** reminder frequency on the quote (5/7/10/14/custom); snooze or next-date action on the notification.
- **Blocked by:** follow-up date/frequency fields + due-notification trigger on the backend.
- **User impact if built without backend:** reminders won't save or fire.

### P4. Validity dates + Project Notifications page + badges 🟡 — blocked on backend
- **Context:** There are no `estimate_valid_till` / `price_validity_date` / hardware/final-payment flags, and no due-calculation + notify trigger, so expiry can't be computed or alerted.
- **Frontend scope:** Valid Till field on the estimate form; Price Validity date picker in the convert dialog; Project Notifications page (Operations → under Projects) with expiring/stagnant list + Extend (1 month/custom) / Client Paid (remind after X days) / Close actions; validity badge/warning in the Projects list.
- **Blocked by:** new date/payment fields + due-notification trigger on the backend.
- **User impact if built without backend:** dates won't persist, no expiry alerts.
