# MAC CRM Changes ✅ = Done | 🟡 = Pending

---

## OLD CHANGES

### 1. Quote me inline quick-add ✅
- Floor / Area: row dropdown footer "+ Add" — sirf naam wala dialog, auto-select, list auto-refresh (`QuickNameDialog`).
- Product: "+ Add Product" footer → master-mirror dialog → row me auto-select + rate fill (`ProductQuickAddDialog`).
- Service: row dropdown me search + "+ Add Service" → master-mirror dialog → service tick + row me auto-select (`ServiceQuickAddDialog`).
- Buyer: form chhode bina naya buyer banao, auto-select ho jayega (inline dialog, `handleCreateBuyer`).
- Brand: product dialog ke andar inline add, auto-select.
- Dropdown width fix: Service/Floor/Area selects, Area `md:w-2/3`; menu min-width 240px; Add button text truncate.
- Product quick-add Rate-0 fix: fresh product object se price (stale list bypass) — Rate/Amount turant sahi.

### 2. Add Quotation form ✅
- Buyer me search + Add New Buyer option — form chhode bina naya buyer, auto-select.
- Product dropdown khaali ho to wajah batayega (`getProductEmptyHint` — e.g. Frame products Smart Switches me hai, wahi tick karo).
- Category me product hai to dropdown me dikhega; select karte hi row ka Service khud sahi ho jayega + rate auto-bharega (`handleProductSelect`).
- Edit me Save Changes (overwrite) + Save as New (aaj ki date me naya quote, `handleSaveAsNew`).
- Validity Date field (Required, default Empty) — Create/Edit Basic Details + list column (`quotation_validity_date`).

### 3. Quotation PDF — Page 1 (Cover) ✅
- Logo white box hataya, sirf logo.
- "Exclusively Prepared For" dark & clear, Client name bada, neeche gap kam.
- Service pills: Room Audio + Lights alag-alag, Door & Gate Automation, 800+ Projects Completed.
- Client, Client Contact, Property Type, Ref, Date + Prepared By (4 persons dropdown).

### 4. Quotation PDF — Scope/Pricing ✅
- Har service ka alag total + Grand Total.
- Consultancy & Design % aur Installation % — 5/7/10/15 presets ya custom % (PDF me % number nahi, sirf value).
- Finish column sirf Smart Switches me; Brand column chauda (lambe naam ek line me).
- Net Project Value + Payment Milestones (30/60/10) + Bank/UPI + sign blocks.

### 5. Company Profile page ✅
- Room Audio + CCTV & Security included, "Why choose MAKc?", Service Excellence, Awards.

---

## NEW CHANGES

### 1. Unsaved-changes popup ✅
- Pure shadcn `AlertDialog` — Stay / Leave without saving / Save & Leave (koi native `confirm()` nahi).
- Files: `src/hooks/useUnsavedChangesGuard.js` + `src/components/common/unsaved-changes-dialog.jsx`.
- Quotation + Revised + Project forms me integrated — Back/Cancel buttons, sidebar/header links, browser Back sab par popup; refresh/tab-close par browser native (OS restriction).
- Clickable fix: guard ka capture listener dialog ke buttons block kar raha tha — `data-unsaved-dialog` se fix.

### 2. Save working file (no redirect to list) ✅
- Save dabane par list par nahi jata — Edit me yahi rehta hai (+ refetch, toast).
- Create me naye record ke edit page par `replace:true` se jata hai (kaam continue).
- Quotation + Revised + Project forms teeno me same pattern (`saveWithoutNavigate`).

### 3. Product dropdown (show Immediately) ✅
- Root cause: product create/update sirf `["products"]` invalidate karta tha, `["products-for-quotation"]` stale rehta tha — ab dono invalidate (`useProduct.js`).
- Quick-add ab category bhi auto-tick karta hai (sirf service tick se product gayab lagta tha).
- Row fallback strong: checked-list → all-services row match → category fallback + just-created.
- Quotation + Revised + Project forms me **Refresh Products** button — page chhode bina list refresh.

### 4. Convert to Project Dialog & Bridge ✅
- Quotation list me "Convert to Project" click karne par custom dialog khulta hai with `Price Validity Date` input.
- Save hone par dialog turant close hota hai (`setConvertDialogOpen(false)`).
- Full quotation details & line items fetch karke `POST /project` API se naya Project create hota hai (dual-mapping keys ke saath), aur quotation status "Project" update ho jata hai.
- Payload me `price_validity_date` ab backend ko successfully send hota hai.

### 5. Project Module APIs & Status Management ✅
- Backend dev ke instructions ke mutabiq saare 6 endpoints live integrate kiye gaye:
  - `GET /project` → Projects table list with pagination, search, status filter.
  - `POST /project` → New project create (`ProjectFormPage` + `QuotationListPage` bridge).
  - `GET /project/{id}` → Edit mode me project details auto-fill.
  - `PUT /project/{id}` → Project update & save without leaving page.
  - `DELETE /project-sub/{id}` → Floor, Area ya Product line item delete karne par sub record delete.
  - `PATCH /projects/{id}/status` → Project status update (Approved / Cancel / Project).
- Status Update Fix: Backend DB me column `quotation_status` hone ki wajah se payload me `quotation_status`, `project_status`, aur `status` teeno keys bheji ja rahi hain taaki status "Approved" seamlessly save ho.
- Project List Actions dropdown me direct quick actions add kiye: "Mark as Approved", "Set as Project", "Mark as Cancel".

### 6. Project Form Products & Auto-fill Parity ✅
- `SelectWithAdd` me string-safe type matching (`String(opt.value) === String(v)`), jisse edit mode me pre-saved Service, Floor, Area aur Product dropdowns blank nahi dikhte.
- Row Service auto-sync: Row me service select karte hi `formData.project_service_id` auto-update hota hai aur checkbox tick ho jata hai, jisse `/getProducts` API turant trigger ho kar products fetch karti hai.
- `openProductQA` me index variable fix (`areaIndex: areaIdx, prodIndex: prodIdx`).
- Product dropdown me `isLoading`, `isDisabled`, aur guidance hints (`"Please select at least one Category in the checkboxes above to load products."`) add kiye.
- Quotation aur Project dono forms ab exact same products dikhate hain.
